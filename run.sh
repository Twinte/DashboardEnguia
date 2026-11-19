#!/bin/sh
set -eu

PROJECT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$PROJECT_DIR"

for command in docker python3 systemctl systemd-run; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Comando necessário ausente: $command" >&2
        exit 1
    fi
done

docker compose version >/dev/null
systemctl --user show-environment >/dev/null

if [ ! -f .env ]; then
    cp .env.example .env
fi

docker compose up -d

if [ ! -x .venv.local/bin/python ]; then
    python3 -m venv .venv.local
fi
PYTHON="$PROJECT_DIR/.venv.local/bin/python"
"$PYTHON" -m pip install --disable-pip-version-check -r enguia/requirements.txt

start_service() {
    service=$1
    shift
    if systemctl --user is-active --quiet "$service"; then
        echo "$service já está ativo."
    elif [ "$(systemctl --user show "$service" -p LoadState --value)" = "loaded" ]; then
        systemctl --user start "$service"
    else
        systemd-run --user --unit="$service" --property=Type=exec \
            --working-directory="$PROJECT_DIR/enguia" "$PYTHON" -u "$@"
    fi
}

start_service dashboardenguia-api -c \
    'from app_flask import app, initialize_app; initialize_app(); app.run(host="127.0.0.1", port=8000, debug=False)'

"$PYTHON" - <<'PY'
import time
import urllib.error
import urllib.request

for attempt in range(30):
    try:
        with urllib.request.urlopen("http://127.0.0.1:8000/api/latest_data", timeout=2):
            break
    except urllib.error.HTTPError as error:
        if error.code == 404:
            break  # API pronta, aguardando a primeira leitura.
        raise
    except (urllib.error.URLError, TimeoutError):
        if attempt == 29:
            raise SystemExit("A API não iniciou. Consulte journalctl --user -u dashboardenguia-api -n 30")
        time.sleep(1)
PY

start_service dashboardenguia-simulador simulate_boat.py

"$PYTHON" - <<'PY'
import json
import time
import urllib.error
import urllib.request

previous_timestamp = None
for attempt in range(60):
    try:
        with urllib.request.urlopen("http://127.0.0.1:5173/", timeout=2):
            pass
        with urllib.request.urlopen("http://127.0.0.1:8000/api/latest_data", timeout=2) as response:
            timestamp = json.load(response).get("Timestamp")
        if timestamp and previous_timestamp and timestamp != previous_timestamp:
            print("Dashboard pronto em http://localhost:5173")
            print("API e simulador ativos, com novas leituras confirmadas.")
            break
        previous_timestamp = timestamp
    except (urllib.error.URLError, TimeoutError, ValueError):
        pass
    if attempt == 59:
        raise SystemExit("Inicialização incompleta. Consulte docker compose logs e journalctl --user -u dashboardenguia-api -u dashboardenguia-simulador -n 30")
    time.sleep(1)
PY
