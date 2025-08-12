// src/components/SettingsPage.jsx
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext'; // 1. Importar o hook para as notificações
import logoNorteEnergia from '../assets/logos/norteenergia.svg'; 
import "./SettingsPage.css";

const availableLanguages = [
    { code: 'en', name: 'English (US)' },
    { code: 'pt', name: 'Português (BR)' },
];

const availableThemes = [
    { value: 'dark', labelKey: 'dark_theme' }, 
    { value: 'light', labelKey: 'light_theme' }, 
];

const SettingsPage = () => {
  const { t } = useTranslation(); 
  const { theme, changeTheme, language, changeLanguage } = useSettings(); 
  const { addToast } = useToast(); // 2. Chamar o hook para ter acesso à função addToast

  const [activeCategoryKey, setActiveCategoryKey] = useState('appearance'); 

  const getSettingsData = () => ({
      appearance: [ 
        { labelKey: 'theme', descriptionKey: 'choose_theme_description', type: "themeSelect" },
        { labelKey: 'language', descriptionKey: 'select_dashboard_language', type: "languageSelect" },
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
        { labelKey: "energy_mode", descriptionKey: "select_energy_mode", type: "select", options: ["Performance", "Eco", "Balanced"] }, 
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
  });
  
  const settingsData = getSettingsData();
  const categories = Object.keys(settingsData); 

  const handleCategoryClick = (categoryKey) => {
    setActiveCategoryKey(categoryKey);
  };

  // 3. Função para ser chamada ao clicar no botão de guardar
  const handleSaveChanges = () => {
    // A lógica para guardar os dados viria aqui.
    // Após a lógica ser concluída com sucesso, exibimos a notificação.
    addToast(t('save_changes_success_toast'), 'success');
  };

  return (
    <div className="settings-page">
      {/* Sidebar Navigation */}
      <div className="settings-sidebar">
        <h3 className="sidebar-title">{t('settings')}</h3>
        <ul>
          {categories.map((categoryKey) => (
            <li
              key={categoryKey}
              onClick={() => handleCategoryClick(categoryKey)}
              className={activeCategoryKey === categoryKey ? "active" : ""} 
            >
              {t(categoryKey)} 
            </li>
          ))}
        </ul>
        
        <div className="logo-profile-section">
          <img src={logoNorteEnergia} alt={t('logo_alt_text')} className="sidebar-logo" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="settings-content">
        <h2>{t(activeCategoryKey)} {t('settings')}</h2> 
        <div className="settings-list">
          {settingsData[activeCategoryKey]?.map((setting, index) => ( 
            <div
              key={index}
              className="setting-item card"
            >
              <h3>{t(setting.labelKey)}</h3> 
              {setting.descriptionKey && <p>{t(setting.descriptionKey)}</p>}

              {setting.type === "themeSelect" && (
                <select value={theme} onChange={(e) => changeTheme(e.target.value)}>
                  {availableThemes.map((themeOption) => (
                    <option key={themeOption.value} value={themeOption.value}>
                      {t(themeOption.labelKey)} 
                    </option>
                  ))}
                </select>
              )}

              {setting.type === "languageSelect" && (
                <select value={language} onChange={(e) => changeLanguage(e.target.value)}>
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} 
                    </option>
                  ))}
                </select>
              )}
               {setting.type === "select" && setting.options && (
                 <select>
                   {setting.options.map((option, idx) => (
                     <option key={idx} value={option}>
                       {t(option.toLowerCase().replace(/ /g, '_')) || option} 
                     </option>
                   ))}
                 </select>
               )}
              {setting.type === "number" && <input type="number" />}
              {setting.type === "text" && <input type="text" />}
              {setting.type === "password" && <input type="password" />}
              {setting.type === "toggle" && <input type="checkbox" className="toggle-switch"/>} 
              {setting.type === "color" && <input type="color" />} 
            </div>
          ))}
        </div>
         <div className="action-buttons">
           <button className="btn">{t('cancel')}</button> 
           {/* 4. Adicionar o onClick ao botão para chamar a função */}
           <button className="btn btn-primary" onClick={handleSaveChanges}>
             {t('save_changes')}
           </button> 
         </div>
      </div>
    </div>
  );
};

export default SettingsPage;