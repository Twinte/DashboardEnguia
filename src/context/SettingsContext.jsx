import React, { createContext, useState, useEffect, useContext } from 'react';
import i18n from '../i18n'; // Importa a configuração do i18next

// 1. Criar o Contexto
const SettingsContext = createContext();

// 2. Criar o Provedor (Provider)
export const SettingsProvider = ({ children }) => {
  // Tenta ler as preferências guardadas no localStorage ou usa padrões
  const initialTheme = localStorage.getItem('theme') || 'dark'; // Padrão: dark
  const initialLanguage = localStorage.getItem('language') || i18n.language || 'en'; // Padrão: detetado ou 'en'

  const [theme, setTheme] = useState(initialTheme);
  const [language, setLanguage] = useState(initialLanguage);

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

  // Funções para mudar o estado
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  // 3. Fornecer o estado e as funções para os componentes filhos
  return (
    <SettingsContext.Provider value={{ theme, changeTheme, language, changeLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
};

// 4. Hook personalizado para facilitar o uso do contexto
export const useSettings = () => {
  return useContext(SettingsContext);
};