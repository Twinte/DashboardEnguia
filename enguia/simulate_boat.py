# simulate_boat.py
import random
import time
from datetime import datetime
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import socket

API_URL = "http://127.0.0.1:8000/api/insert_data"

# Base coordinates - Belém, Pará, Brazil
BASE_LAT = -1.4558
BASE_LNG = -48.5036

def create_session_with_retries():
    session = requests.Session()
    retry_strategy = Retry(
        total=3,
        backoff_factor=0.2,
        status_forcelist=[500, 502, 503, 504],
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

# --- Funções de Simulação ---

def getTimestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def getVelocidadeKPH(current_speed, battery_percentage):
    max_speed = 80
    acceleration_rate = 0.2
    deceleration_rate = 0.1
    if current_speed < max_speed and battery_percentage > 5:
        speed_increase = random.uniform(0.5, acceleration_rate)
        return round(min(current_speed + speed_increase, max_speed), 1)
    elif current_speed > 0:
        speed_decrease = random.uniform(0.5, deceleration_rate)
        return round(max(current_speed - speed_decrease, 0), 1)
    return 0.0

def getRPM(current_speed, battery_percentage):
    base_rpm = 3000
    rpm = (current_speed / 80) * base_rpm
    rpm_adjustment = (battery_percentage / 100) * 0.2
    return max(int(rpm * rpm_adjustment), 0)

def getVoltagemBateria(battery_percentage):
    base_voltage = 340
    min_voltage = 330
    voltage_range = base_voltage - min_voltage
    return round(min_voltage + (battery_percentage / 100) * voltage_range, 2)

def getPorcentagemBateria(battery_percentage, current_corrente):
    # O dreno agora é baseado na corrente (A) dividida por um fator
    # Ajuste o 'fator_dreno' conforme necessário para a simulação
    fator_dreno = 1000  # Exemplo: 50A / 1000 = 0.05% de dreno por segundo
    drain_rate = current_corrente / fator_dreno
    new_percentage = max(battery_percentage - drain_rate, 0)
    return round(new_percentage, 2)

def getVelocidadeVento():
    base_wind_speed = 10
    wind_fluctuation = random.uniform(-1, 2)
    return round(base_wind_speed + wind_fluctuation, 1)

def getTemperatura(current_temp):
    max_temp = 45
    temp_increase = random.uniform(0.1, 0.3)
    if current_temp < max_temp:
        return min(max_temp, round(current_temp + temp_increase, 1))
    return current_temp

# --- NOVO: Função para simular Corrente Elétrica ---
def getCorrente(current_speed):
    # Simula corrente: 5A em idle (0 KPH), até 50A em velocidade máxima (80 KPH)
    base_current = 5.0 + (current_speed / 80) * 45.0
    fluctuation = random.uniform(-1.0, 1.0) # Adiciona ruído
    return round(max(0, base_current + fluctuation), 2)

# --- NOVO: Funções para simular dados adicionais ---

def getHeading(current_heading):
    """Simulate compass heading with small random changes"""
    change = random.randint(-3, 3)
    new_heading = (current_heading + change) % 360
    return new_heading

def getGPS(current_lat, current_lng, current_speed):
    """Simulate GPS coordinates - boat moves based on speed and heading"""
    # Only move if boat is moving
    if current_speed > 0:
        # Convert heading to rough direction (simplified)
        # 1 degree at equator ≈ 111km, so for small movement:
        movement_factor = 0.0001 * (current_speed / 50)  # Scale by speed
        lat_change = movement_factor * random.uniform(-1, 1)
        lng_change = movement_factor * random.uniform(-1, 1)
        current_lat = round(current_lat + lat_change, 6)
        current_lng = round(current_lng + lng_change, 6)
    return current_lat, current_lng

def checkWifi():
    """Check WiFi connectivity - simulates connected state"""
    try:
        socket.create_connection(("8.8.8.8", 53), timeout=2)
        return True
    except:
        return False

def calculateTimeRemaining(battery_pct, corrente):
    """Calculate estimated time remaining in hours"""
    if corrente > 0:
        # Assume 50Ah total battery capacity
        capacity_ah = 50.0
        current_ah_remaining = (battery_pct / 100) * capacity_ah
        hours = current_ah_remaining / corrente
        return round(hours, 1)
    return 0.0

def getBatteryHealth(battery_cycles):
    """Simulate battery health based on cycles"""
    if battery_cycles < 100:
        return "Excellent"
    elif battery_cycles < 300:
        return "Good"
    elif battery_cycles < 500:
        return "Fair"
    else:
        return "Poor"

def getTrimPosition(current_trim, direction):
    """Update trim position: -5 (up) to +5 (down), 0 = center"""
    if direction == "up":
        return max(-5, current_trim - 1)
    elif direction == "down":
        return min(5, current_trim + 1)
    return current_trim


def get_electrical_diagnostics(voltage, current, temperature, battery_percentage):
    auxiliary_voltage = round(random.uniform(12.4, 12.8), 1)
    auxiliary_current = round(random.uniform(1.5, 3.0), 1)
    ports = {}
    for port, volts, amps, limit in (
        ("P1", voltage, current, 20),
        ("P2", auxiliary_voltage, auxiliary_current, 0.1),
        ("P3", 0, 0, 10),
    ):
        ports[port] = {
            "voltage": volts,
            "current": amps,
            "power_kw": round(volts * amps / 1000, 3),
            "limit_kw": limit,
        }
    cell_voltage = voltage / 96
    return {
        "simulated": True,
        "ports": ports,
        "bms": {
            "cell_min": round(cell_voltage - 0.02, 2),
            "cell_max": round(cell_voltage + 0.02, 2),
            "temp_min": round(temperature - 2, 1),
            "temp_max": round(temperature + 2, 1),
        },
        "supercapacitors": {
            "energy_pct": round(battery_percentage * 0.85, 1),
            "balancing": False,
        },
        "converter": {
            "precharge_complete": True,
            "contactors_closed": True,
            "ccs2_charging": False,
        },
    }


def simulate_electric_boat_forever(delay=1):
    battery_percentage = 100
    current_speed = 0
    current_temp_c = 20
    current_heading = random.randint(0, 360)
    current_lat = BASE_LAT
    current_lng = BASE_LNG
    battery_cycles = 0
    alarm_events = [{
        "source": "simulator",
        "severity": "info",
        "code": "SIM_STARTED",
        "time": getTimestamp(),
        "acknowledged": None,
    }]

    session = create_session_with_retries()

    while True:
        # Ordem atualizada: Obter velocidade primeiro
        current_speed = getVelocidadeKPH(current_speed, battery_percentage)

        # NOVO: Obter corrente com base na velocidade
        current_corrente = getCorrente(current_speed)

        # Obter RPM
        current_rpm = getRPM(current_speed, battery_percentage)

        # Obter outros dados
        current_temp_c = getTemperatura(current_temp_c)
        current_wind_speed = getVelocidadeVento()

        # NOVO: Obter heading e GPS
        current_heading = getHeading(current_heading)
        current_lat, current_lng = getGPS(current_lat, current_lng, current_speed)

        # Atualizado: Passar a corrente para calcular o dreno da bateria
        battery_percentage = getPorcentagemBateria(battery_percentage, current_corrente)
        current_voltage = getVoltagemBateria(battery_percentage)

        # Increment battery cycles while boat is running
        if current_speed > 0:
            battery_cycles += 0.001  # Very slow simulation

        # NOVO: Calcular tempo restante e saúde da bateria
        time_remaining = calculateTimeRemaining(battery_percentage, current_corrente)
        battery_health = getBatteryHealth(battery_cycles)

        if battery_percentage <= 0:
            print("Bateria esgotada. Encerrando a simulação.")
            break

        timestamp = getTimestamp()
        if battery_percentage < 20 and len(alarm_events) == 1:
            alarm_events.insert(0, {
                "source": "battery",
                "severity": "warning",
                "code": "LOW_BATTERY",
                "time": timestamp,
                "acknowledged": False,
            })

        electrical = get_electrical_diagnostics(current_voltage, current_corrente, current_temp_c, battery_percentage)
        data = {
            "Timestamp": timestamp,
            "Velocidade_KPH": current_speed,
            "RPM": current_rpm,
            "Voltagem_bateria": current_voltage,
            "Porcentagem_bateria": battery_percentage,
            "Velocidade_vento": current_wind_speed,
            "Temperatura": current_temp_c,
            # NOVO: Adicionar Corrente (Amperes) ao payload
            "Corrente_A": current_corrente,
            # NOVO: Adicionar campos adicionais
            "heading": current_heading,
            "lat": current_lat,
            "lng": current_lng,
            "wifi_connected": checkWifi(),
            "battery_time_remaining": time_remaining,
            "battery_health": battery_health,
            "trim_bow": 0,
            "power_diagnostics": {
                "simulated": True,
                "booster_available": battery_percentage >= 20 and current_temp_c <= 45,
                "operational_healthy": battery_percentage >= 20 and current_temp_c <= 45,
                "emergency_stop_active": False,
                "interlocks_satisfied": True,
                "auxiliary_voltage": electrical["ports"]["P2"]["voltage"],
            },
            "electrical_diagnostics": electrical,
            "alarm_events": alarm_events,
        }

        try:
            response = session.post(API_URL, json=data, timeout=5)
            response.raise_for_status()
            print("Dados enviados com sucesso:", data)

        except requests.exceptions.RequestException as e:
            print(f"Erro de conexão após múltiplas tentativas: {e}")

        time.sleep(delay)

if __name__ == '__main__':
    simulate_electric_boat_forever(delay=1)
