// src/context/SettingsContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import i18n from '../i18n'; // Importa a configuração do i18next

// 1. Criar o Contexto
const SettingsContext = createContext();

// 2. Criar o Provedor (Provider)
export const SettingsProvider = ({ children }) => {
  // Tenta ler as preferências guardadas no localStorage ou usa padrões
  const initialTheme = localStorage.getItem('theme') || 'dark';
  const initialLanguage = localStorage.getItem('language') || i18n.language || 'en';
  // NOVO: Ler o modo de energia guardado ou usar 'balanced' como padrão
  const initialEnergyMode = localStorage.getItem('energyMode') || 'balanced';

  const [theme, setTheme] = useState(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);
  // NOVO: Criar estado para o modo de energia
  const [energyMode, setEnergyMode] = useState(initialEnergyMode);


  // Efeito para aplicar a classe do tema ao body e guardar no localStorage
  useEffect(() => {
    document.body.classList.remove('light', 'dark'); // Remove classes antigas
    document.body.classList.add(theme); // Adiciona a classe atual
    localStorage.setItem('theme', theme); // Guarda no localStorage
  }, [theme]);

  // Efeito para mudar o idioma no i18next e guardar no localStorage
  useEffect(() => {
    i18n.changeLanguage(language); // Muda o idioma globalmente
    localStorage.setItem('language', language); // Guarda no localStorage
  }, [language]);

  // NOVO: Efeito para guardar o modo de energia no localStorage
  useEffect(() => {
    localStorage.setItem('energyMode', energyMode);
  }, [energyMode]);


  // Funções para mudar o estado
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };
  
  // NOVO: Função para alterar o modo de energia
  const changeEnergyMode = (newMode) => {
    setEnergyMode(newMode);
  };


  // 3. Fornecer o estado e as funções para os componentes filhos
  return (
    <SettingsContext.Provider 
      value={{ 
        theme, 
        changeTheme, 
        language, 
        changeLanguage,
        // NOVO: Fornecer o estado e a função
        energyMode,
        changeEnergyMode
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// 4. Hook personalizado para facilitar o uso do contexto
export const useSettings = () => {
  return useContext(SettingsContext);
};