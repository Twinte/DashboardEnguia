// src/components/PowerPage.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import GaugeChart from 'react-gauge-chart'; // Reutilizar o GaugeChart para percentagem
import { FaBolt, FaTemperatureHigh, FaBatteryFull } from 'react-icons/fa'; // Ícones relevantes
import './PowerPage.css'; // Importar o CSS específico

// Definir limites e cores para o medidor de percentagem (ajuste conforme necessário)
const batteryPercentColors = ["#E74C3C", "#F1C40F", "#2ECC71"]; // Vermelho, Amarelo, Verde
const batteryPercentLimits = [0.2, 0.5, 1]; // Até 20%, 50%, 100%

const PowerPage = ({ sensorData }) => {
  const { t } = useTranslation();

  // Extrair dados relevantes do sensorData para clareza
  const percentage = sensorData?.batteryPercentage || 0;
  const voltage = sensorData?.batteryVoltage || 0;
  const temperature = sensorData?.temp || 0; // Usando temp geral por enquanto

  // Calcular a percentagem para o GaugeChart (valor entre 0 e 1)
  const gaugePercent = percentage / 100;

  return (
    <div className="power-page-container">
      
      {/* Secção Principal - Medidor de Percentagem */}
      <div className="power-main-gauge">
        <GaugeChart
          id="battery-percentage-gauge"
          nrOfLevels={30} // Mais níveis para suavidade
          arcsLength={batteryPercentLimits}
          colors={batteryPercentColors}
          percent={gaugePercent}
          arcPadding={0.02}
          needleColor="var(--gauge-needle)"
          needleBaseColor="var(--gauge-needle)"
          hideText // Esconder texto padrão, vamos colocar o nosso
          style={{ width: '70%', maxWidth: '400px' }} // Ajuste o tamanho
        />
        <div className="power-percentage-label">
          <FaBatteryFull className="label-icon" />
          <span className="value">{percentage}%</span>
          <span className="unit">{t('battery_charge')}</span> 
          {/* Adicione 'battery_charge' aos seus ficheiros de tradução */}
        </div>
      </div>

      {/* Secção de Detalhes Adicionais */}
      <div className="power-details">
        <div className="detail-item">
          <FaBolt className="detail-icon voltage-icon" />
          <div className="detail-text">
            <span className="detail-label">{t('voltage')}</span> 
            {/* Adicione 'voltage' aos seus ficheiros de tradução */}
            <span className="detail-value">{voltage.toFixed(1)} V</span>
          </div>
        </div>

        <div className="detail-item">
          <FaTemperatureHigh className="detail-icon temp-icon" />
          <div className="detail-text">
            <span className="detail-label">{t('temperature')}</span> 
            {/* Chave 'temperature' já deve existir */}
            <span className="detail-value">{temperature}°C</span>
          </div>
        </div>
        
        {/* Placeholder para Consumo Atual (quando tiver o sensor) */}
        {/* <div className="detail-item">
          <FaPlug className="detail-icon consumption-icon" /> 
          <div className="detail-text">
            <span className="detail-label">{t('current_draw')}</span> 
            <span className="detail-value">-- A</span> 
          </div>
        </div> 
        */}

        {/* Placeholder para Autonomia (quando tiver o cálculo) */}
        {/* <div className="detail-item">
          <FaClock className="detail-icon autonomy-icon" />
          <div className="detail-text">
            <span className="detail-label">{t('estimated_time_remaining')}</span> 
            <span className="detail-value">-- h -- min</span>
          </div>
        </div> 
        */}
      </div>

    </div>
  );
};

export default PowerPage;