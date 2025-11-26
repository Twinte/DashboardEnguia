// src/components/SettingsPage.jsx
import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { useToast } from '../context/ToastContext';
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
  const { theme, changeTheme, language, changeLanguage, energyMode, changeEnergyMode } = useSettings(); 
  const { addToast } = useToast();

  const [activeCategoryKey, setActiveCategoryKey] = useState('appearance'); 

  const getSettingsData = () => ({
      appearance: [ 
        { labelKey: 'theme', descriptionKey: 'choose_theme_description', type: "themeSelect" },
        { labelKey: 'language', descriptionKey: 'select_dashboard_language', type: "languageSelect" },
      ],
      account: [
        { labelKey: 'email', descriptionKey: 'update_email', type: "text", defaultValue: "captain@highsea.com" },
        { labelKey: 'password', descriptionKey: 'change_password', type: "password", defaultValue: "********" },
      ],
      security: [
        { labelKey: "two_factor_auth", descriptionKey: "enable_disable_2fa", type: "toggle", defaultValue: true },
        { labelKey: "login_notifications", descriptionKey: "enable_disable_login_notifications", type: "toggle", defaultValue: false },
      ],
      battery_energy: [ 
        { labelKey: "battery_threshold", descriptionKey: "set_battery_threshold", type: "number", defaultValue: 20 },
        { labelKey: "energy_mode", descriptionKey: "select_energy_mode", type: "select", options: ["performance", "eco", "balanced"] }, 
      ],
      alerts: [ 
        { labelKey: "low_battery_alert", descriptionKey: "set_low_battery_alert", type: "number", defaultValue: 15 },
        { labelKey: "high_temp_alert", descriptionKey: "set_high_temp_alert", type: "number", defaultValue: 60 },
      ],
      navigation_autopilot: [ 
        { labelKey: "autopilot_mode", descriptionKey: "toggle_autopilot", type: "toggle", defaultValue: false },
        { labelKey: "route_planning", descriptionKey: "set_route_preferences", type: "select", options: ["Default", "Custom"] },
        { labelKey: "compass_calibration", descriptionKey: "adjust_compass_calibration", type: "select", options: ["Auto", "Manual"] },
      ],
  });
  
  const settingsData = getSettingsData();
  const categories = Object.keys(settingsData); 

  const handleCategoryClick = (categoryKey) => {
    setActiveCategoryKey(categoryKey);
  };

  const handleSaveChanges = () => {
    addToast(t('save_changes_success_toast'), 'success');
  };

  return (
    <div className="settings-page">
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
          <img src={logoNorteEnergia} alt="Logo" className="sidebar-logo" />
        </div>
      </div>

      <div className="settings-content">
        <h2>{t(activeCategoryKey)}</h2> 
        
        <div className="settings-list">
          {settingsData[activeCategoryKey]?.map((setting, index) => ( 
            <div key={index} className="setting-item">
              
              {/* Label Section */}
              <div className="setting-info">
                <h3>{t(setting.labelKey)}</h3> 
                {setting.descriptionKey && <p>{t(setting.descriptionKey)}</p>}
              </div>

              {/* Input Section */}
              <div className="setting-input-wrapper">
                
                {setting.type === "themeSelect" && (
                  <select value={theme} onChange={(e) => changeTheme(e.target.value)}>
                    {availableThemes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {t(option.labelKey)} 
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
                   <select 
                     value={setting.labelKey === 'energy_mode' ? energyMode : undefined}
                     onChange={setting.labelKey === 'energy_mode' ? (e) => changeEnergyMode(e.target.value) : undefined}
                   >
                     {setting.options.map((option, idx) => (
                       <option key={idx} value={option.toLowerCase().replace(/ /g, '_')}>
                         {t(option.toLowerCase().replace(/ /g, '_')) || option} 
                       </option>
                     ))}
                   </select>
                 )}

                {setting.type === "number" && <input type="number" defaultValue={setting.defaultValue} />}
                {setting.type === "text" && <input type="text" defaultValue={setting.defaultValue} />}
                {setting.type === "password" && <input type="password" defaultValue={setting.defaultValue} />}
                {setting.type === "toggle" && <input type="checkbox" className="toggle-switch" defaultChecked={setting.defaultValue}/>} 
                {setting.type === "color" && <input type="color" />} 
              </div>
            </div>
          ))}
        </div>

         <div className="action-buttons">
           <button className="btn">{t('cancel')}</button> 
           <button className="btn btn-primary" onClick={handleSaveChanges}>
             {t('save_changes')}
           </button> 
         </div>
      </div>
    </div>
  );
};

export default SettingsPage;