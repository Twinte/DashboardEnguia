import sqlite3
import numpy as np
from datetime import datetime
import socket
import time


# Simulacao dos sensores
def getTimestamp(): return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
def getVelocidadeKPH(): return round(np.random.uniform(0, 100), 4)
def getRPM(): return round(np.random.uniform(0, 50), 4)
def getVoltagemBateria(): return round(np.random.uniform(0, 100), 4)
def getPorcentagemBateria(): return np.random.randint(0, 101)
def getVelocidadeVento(): return round(np.random.uniform(0, 100), 4)
def getTemperatura(): return round(np.random.uniform(0, 100), 4)


# Conectar/criar banco de dados sqlite
conn = sqlite3.connect("barco.db")
cursor = conn.cursor()

# Conectar ao banco de dados MongoDB

# Conexao Wi-Fi
# Verifica se tem conexao e retorna flag
def conexao_wifi():
    try:
        # Google DNS (8.8.8.8) na porta 53
        socket.create_connection(("8.8.8.8", 53), timeout=5)
        return False#True
    except OSError:
        return False

# Criar tabela
def create_table():
    cursor.execute(
    '''
        CREATE TABLE IF NOT EXISTS barco_info (
        ID INTEGER PRIMARY KEY AUTOINCREMENT, 
        Timestamp TEXT,
        Velocidade_KPH REAL,                  
        RPM REAL,            
        Voltagem_bateria REAL,
        Porcentagem_bateria INTEGER,
        Velocidade_vento REAL,
        Temperatura REAL
        ); 
    '''  
    )
    conn.commit()

# Exibir dados
def select_data(table_name):
    query = f'''
        SELECT *
        FROM {table_name};
    '''
    cursor.execute(query)
    rows = cursor.fetchall()
    #print(rows)
    for row in rows:
        print(row)

def insert_data():
    timestamp = getTimestamp()
    veloc_kph = getVelocidadeKPH()
    rpm = getRPM()
    volt_bateria = getVoltagemBateria()
    porcent_bateria = getPorcentagemBateria()
    veloc_vento = getVelocidadeVento()
    temperatura = getTemperatura()

    if (conexao_wifi()):
        pass # envio para o MongoDB
    else:
        cursor.execute(
    '''
        INSERT INTO barco_info (Timestamp, Velocidade_KPH, RPM, Voltagem_bateria,
          Porcentagem_bateria, Velocidade_vento, Temperatura) VALUES
        (?, ?, ?, ?, ?, ?, ?);
    ''', 
        (timestamp, veloc_kph, rpm, volt_bateria, porcent_bateria, veloc_vento, temperatura)
    )
    conn.commit()
 

# Testar com APScheduler:
def main():
    create_table()
    while True:
        insert_data()
        select_data("barco_info")
        time.sleep(2)

main()