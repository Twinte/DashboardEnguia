// src/components/SettingsPage.jsx
import React, { useState } from "react";
import { useTranslation } from 'react-i18next'; // **Passo 7: Importar hook de tradução**
import { useSettings } from '../context/SettingsContext'; // **Passo 7: Importar hook de settings**
import { FaUserCircle } from "react-icons/fa";
import "./SettingsPage.css"; // Certifique-se que este CSS usa variáveis de tema

// **Passo 7: Definir idiomas e temas disponíveis**
const availableLanguages = [
    { code: 'en', name: 'English (US)' },
    { code: 'pt', name: 'Português (BR)' },
    // Adicione mais idiomas aqui
];

const availableThemes = [
    { value: 'dark', labelKey: 'dark_theme' }, // Usa chave de tradução
    { value: 'light', labelKey: 'light_theme' }, // Usa chave de tradução
];

const SettingsPage = () => {
  const { t } = useTranslation(); // **Passo 7: Inicializar hook de tradução**
  const { theme, changeTheme, language, changeLanguage } = useSettings(); // **Passo 7: Obter estado e funções do contexto**
  
  // Define a categoria ativa inicial usando tradução
  const [activeCategoryKey, setActiveCategoryKey] = useState('appearance'); // Usar a chave, não o texto traduzido

  // **Passo 7: Gerar dados das configurações dinamicamente com traduções**
  // Isto é mais robusto do que ter textos fixos
  const getSettingsData = () => ({
      appearance: [ // Chave da categoria
        { labelKey: 'theme', descriptionKey: 'choose_theme_description', type: "themeSelect" },
        { labelKey: 'language', descriptionKey: 'select_dashboard_language', type: "languageSelect" },
        // Adicione outras configurações de aparência aqui se necessário
        // { labelKey: "brand_color", descriptionKey: "choose_brand_color", type: "color" }, // Exemplo
      ],
      account: [
        { labelKey: 'email', descriptionKey: 'update_email', type: "text" },
        { labelKey: 'password', descriptionKey: 'change_password', type: "password" },
      ],
      security: [
        { labelKey: "two_factor_auth", descriptionKey: "enable_disable_2fa", type: "toggle" },
        { labelKey: "login_notifications", descriptionKey: "enable_disable_login_notifications", type: "toggle" },
      ],
      battery_energy: [
        { labelKey: "battery_threshold", descriptionKey: "set_battery_threshold", type: "number" },
        { labelKey: "energy_mode", descriptionKey: "select_energy_mode", type: "select", options: ["Performance", "Eco", "Balanced"] }, // Options podem precisar de tradução também
      ],
      alerts: [
        { labelKey: "low_battery_alert", descriptionKey: "set_low_battery_alert", type: "number" },
        { labelKey: "high_temp_alert", descriptionKey: "set_high_temp_alert", type: "number" },
      ],
      navigation_autopilot: [
        { labelKey: "autopilot_mode", descriptionKey: "toggle_autopilot", type: "toggle" },
        { labelKey: "route_planning", descriptionKey: "set_route_preferences", type: "select", options: ["Default", "Custom"] },
        { labelKey: "compass_calibration", descriptionKey: "adjust_compass_calibration", type: "select", options: ["Auto", "Manual"] },
      ],
      // Adicione mais categorias aqui...
  });
  
  const settingsData = getSettingsData();
  const categories = Object.keys(settingsData); // ['appearance', 'account', ...]

  // **Passo 7: Adicione as chaves usadas aqui ('choose_theme_description', 'select_dashboard_language', etc.)**
  // **aos seus ficheiros de tradução `translation.json` em `src/locales/en/` e `src/locales/pt/`.**

  const handleCategoryClick = (categoryKey) => {
    setActiveCategoryKey(categoryKey);
  };

  return (
    <div className="settings-page">
      {/* Sidebar Navigation */}
      <div className="settings-sidebar">
        <h3 className="sidebar-title">{t('settings')}</h3> {/* Traduz título */}
        <ul>
          {categories.map((categoryKey) => (
            <li
              key={categoryKey}
              onClick={() => handleCategoryClick(categoryKey)}
              // Compara a chave, não o texto traduzido
              className={activeCategoryKey === categoryKey ? "active" : ""} 
            >
              {t(categoryKey)} {/* Traduz o nome da categoria para exibição */}
            </li>
          ))}
        </ul>
        {/* User Profile Section */}
         <div className="user-profile">
            <FaUserCircle size={50} />
            <div className="user-info">
                {/* Idealmente, estes dados viriam de algum lugar */}
                <span className="user-name">LACIS</span> 
                <span className="user-email">lacis@ufpa.com</span>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="settings-content">
        {/* Traduz o título da categoria ativa */}
        <h2>{t(activeCategoryKey)} {t('settings')}</h2> 
        <div className="settings-list">
          {/* Acede aos dados usando a chave da categoria ativa */}
          {settingsData[activeCategoryKey]?.map((setting, index) => ( 
            <div
              key={index}
              className="setting-item"
            >
              <h3>{t(setting.labelKey)}</h3> {/* **Passo 7: Traduz o label** */}
              {setting.descriptionKey && <p>{t(setting.descriptionKey)}</p>} {/* **Passo 7: Traduz a descrição (se existir)** */}

              {/* **Passo 7: Input específico para TEMA usando o contexto** */}
              {setting.type === "themeSelect" && (
                <select value={theme} onChange={(e) => changeTheme(e.target.value)}>
                  {availableThemes.map((themeOption) => (
                    <option key={themeOption.value} value={themeOption.value}>
                      {t(themeOption.labelKey)} {/* Traduz as opções de tema */}
                    </option>
                  ))}
                </select>
              )}

              {/* **Passo 7: Input específico para IDIOMA usando o contexto** */}
              {setting.type === "languageSelect" && (
                <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} {/* Nomes dos idiomas geralmente não são traduzidos */}
                    </option>
                  ))}
                </select>
              )}

              {/* Renderiza outros tipos de input */}
               {setting.type === "select" && setting.options && (
                 <select>
                   {setting.options.map((option, idx) => (
                     // Idealmente, opções como "Performance", "Eco" também teriam chaves de tradução
                     <option key={idx} value={option}>
                       {t(option.toLowerCase().replace(' ', '_')) || option} {/* Tenta traduzir, senão usa o original */}
                     </option>
                   ))}
                 </select>
               )}
              {setting.type === "number" && <input type="number" />}
              {setting.type === "text" && <input type="text" />}
              {setting.type === "password" && <input type="password" />}
              {setting.type === "toggle" && <input type="checkbox" className="toggle-switch"/>} {/* Adicione uma classe se quiser estilizar */}
              {setting.type === "color" && <input type="color" />} 

            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {/* Estes botões podem agora servir para guardar outras definições que não sejam tema/idioma */}
         <div className="action-buttons">
           <button className="cancel-btn">{t('cancel')}</button> {/* **Passo 7: Traduzir** */}
           <button className="save-btn">{t('save_changes')}</button> {/* **Passo 7: Traduzir** */}
         </div>
      </div>
    </div>
  );
};

export default SettingsPage;