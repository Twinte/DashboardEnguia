// src/components/LoadingScreen.jsx
import React from 'react';
import logoNorteEnergia from '../assets/norte_energia_logo.png'; // Ajuste o caminho se necessário
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      <img src={logoNorteEnergia} alt="Carregando..." className="loading-logo" />
      <div className="loading-bar-container">
        <div className="loading-bar"></div>
      </div>
      <p className="loading-text">A carregar dashboard...</p>
    </div>
  );
};

export default LoadingScreen;