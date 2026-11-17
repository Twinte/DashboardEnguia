# app_flask.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
import json
import socket
import random
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

LOG_DIR = "logs"
LOG_RETENTION_DAYS = 7
TRIM_FILE = "trim_status.json"
SETTINGS_FILE = "user_settings.json"

# --- Helper Functions ---

def check_wifi():
    """Check if WiFi is connected"""
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=3)
        return True
    except:
        return False

def load_trim_status():
    """Load current trim position from file"""
    try:
        if os.path.exists(TRIM_FILE):
            with open(TRIM_FILE, 'r') as f:
                return json.load(f)
    except:
        pass
    return {"bow": 0}

def save_trim_status(status):
    """Save trim position to file"""
    with open(TRIM_FILE, 'w') as f:
        json.dump(status, f)

def load_settings():
    """Load user settings from file"""
    try:
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r') as f:
                return json.load(f)
    except:
        pass
    return {"theme": "dark", "language": "en", "energy_mode": "balanced"}

def save_settings(settings):
    """Save user settings to file"""
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(settings, f)

def get_daily_db_path():
    if not os.path.exists(LOG_DIR):
        os.makedirs(LOG_DIR)
    return os.path.join(LOG_DIR, f"dados_{datetime.now().strftime('%Y-%m-%d')}.db")

def create_table_if_not_exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS barco_info (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Timestamp TEXT,
            Velocidade_KPH REAL,
            RPM REAL,
            Voltagem_bateria REAL,
            Porcentagem_bateria INTEGER,
            Velocidade_vento REAL,
            Temperatura REAL,
            Corrente_A REAL,
            heading REAL,
            lat REAL,
            lng REAL,
            wifi_connected INTEGER,
            battery_time_remaining REAL,
            battery_health TEXT,
            trim_bow INTEGER
        );
        """
    )

    # Migration: Add missing columns to existing tables
    columns_to_add = [
        ("heading", "REAL DEFAULT 0"),
        ("lat", "REAL DEFAULT 0"),
        ("lng", "REAL DEFAULT 0"),
        ("wifi_connected", "INTEGER DEFAULT 1"),
        ("battery_time_remaining", "REAL DEFAULT 0"),
        ("battery_health", "TEXT DEFAULT 'Good'"),
        ("trim_bow", "INTEGER DEFAULT 0")
    ]

    for column_name, column_def in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE barco_info ADD COLUMN {column_name} {column_def}")
        except sqlite3.OperationalError:
            pass  # Column already exists

    conn.commit()
    conn.close()

def cleanup_old_logs():
    print("Executando limpeza de logs antigos...")
    if not os.path.exists(LOG_DIR):
        return

    cutoff_date = datetime.now() - timedelta(days=LOG_RETENTION_DAYS)
    for filename in os.listdir(LOG_DIR):
        if filename.startswith('dados_') and filename.endswith('.db'):
            try:
                file_date_str = filename.replace('dados_', '').replace('.db', '')
                file_date = datetime.strptime(file_date_str, '%Y-%m-%d')
                if file_date < cutoff_date:
                    file_path = os.path.join(LOG_DIR, filename)
                    os.remove(file_path)
                    print(f"Removido log antigo: {filename}")
            except ValueError:
                print(f"Ignorando ficheiro com nome mal formatado: {filename}")

def initialize_app():
    try:
        db_path = get_daily_db_path()
        create_table_if_not_exists(db_path)
        cleanup_old_logs()
        print(f"App initialized successfully. DB path: {db_path}")
    except Exception as e:
        print(f"Error during app initialization: {e}")

@app.route('/')
def index():
    return 'API Robusta com Rotação de Logs está a funcionar!'

@app.route('/api/insert_data', methods=['POST'])
def insert_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # NOVO: Adicionado campos adicionais aos campos obrigatórios
        required_fields = [
            "Timestamp", "Velocidade_KPH", "RPM", "Voltagem_bateria",
            "Porcentagem_bateria", "Velocidade_vento", "Temperatura", "Corrente_A",
            "heading", "lat", "lng", "wifi_connected", "battery_time_remaining",
            "battery_health", "trim_bow"
        ]

        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {missing_fields}"}), 400

        # 1. Escrever no log diário para o histórico
        db_path = get_daily_db_path()
        create_table_if_not_exists(db_path)

        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # NOVO: Atualizado o comando INSERT para incluir todos os campos
        cursor.execute(
            """INSERT INTO barco_info
               (Timestamp, Velocidade_KPH, RPM, Voltagem_bateria, Porcentagem_bateria,
                Velocidade_vento, Temperatura, Corrente_A, heading, lat, lng,
                wifi_connected, battery_time_remaining, battery_health, trim_bow)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data["Timestamp"], data["Velocidade_KPH"], data["RPM"],
                data["Voltagem_bateria"], data["Porcentagem_bateria"],
                data["Velocidade_vento"], data["Temperatura"], data["Corrente_A"],
                data.get("heading", 0), data.get("lat", 0), data.get("lng", 0),
                data.get("wifi_connected", True), data.get("battery_time_remaining", 0),
                data.get("battery_health", "Good"), data.get("trim_bow", 0)
            )
        )
        conn.commit()
        conn.close()

        # 2. Escrever no ficheiro 'live' para a API ler (sobrescreve sempre)
        with open('live_data.json', 'w') as f:
            json.dump(data, f)

        return jsonify({"status": "success"}), 200

    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    except Exception as e:
        print(f"General error in insert_data: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/latest_data', methods=['GET'])
def latest_data():
    try:
        with open('live_data.json', 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except FileNotFoundError:
        return jsonify({"error": "Aguardando primeiro registo de dados"}), 404
    except Exception as e:
        print(f"Error reading live data: {e}")
        return jsonify({"error": str(e)}), 500

# --- NOVO: Additional Endpoints ---

@app.route('/api/status', methods=['GET'])
def get_status():
    """Return system status: WiFi, trim, battery health"""
    try:
        trim_status = load_trim_status()
        return jsonify({
            "wifi_connected": check_wifi(),
            "trim_bow": trim_status.get("bow", 0),
            "battery_health": "Good",
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/trim', methods=['POST'])
def control_trim():
    """Control bow trim: up, down, or reset"""
    try:
        data = request.get_json()
        direction = data.get('direction', 'none')

        current_trim = load_trim_status()
        bow = current_trim.get('bow', 0)

        if direction == 'up':
            bow = max(-5, bow - 1)
        elif direction == 'down':
            bow = min(5, bow + 1)
        elif direction == 'reset':
            bow = 0

        new_status = {"bow": bow}
        save_trim_status(new_status)

        return jsonify({
            "success": True,
            "trim_bow": bow,
            "direction": direction
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/settings', methods=['GET', 'PUT'])
def handle_settings():
    """Get or save user settings"""
    try:
        if request.method == 'PUT':
            settings = request.get_json()
            save_settings(settings)
            return jsonify({"success": True, "settings": settings})
        else:
            settings = load_settings()
            return jsonify(settings)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    try:
        initialize_app()
        app.run(host='0.0.0.0', port=8000, debug=False)
    except Exception as e:
        print(f"Flask app crashed with error: {e}")
