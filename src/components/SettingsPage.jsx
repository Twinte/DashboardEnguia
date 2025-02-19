// src/components/SettingsPage.jsx
import React, { useState } from "react";
import { FaUserCircle } from "react-icons/fa"; // For user avatar
import "./SettingsPage.css";

const settingsData = {
  "Appearance": [
    { label: "Brand Color", description: "Choose your website's brand color", type: "color" },
    { label: "Default Dashboard Style", description: "Choose the default style for your dashboard", type: "select", options: ["Default", "Simplified", "Custom CSS"] },
    { label: "Language", description: "Select the language for the dashboard", type: "select", options: ["English (UK)", "English (US)", "Spanish"] },
    { label: "Cookie Banner", description: "Configure the appearance of the cookie banner", type: "select", options: ["Default", "Simplified", "None"] },
  ],
  "Account": [
    { label: "Email", description: "Update your email address", type: "text" },
    { label: "Password", description: "Change your password", type: "password" },
  ],
  "Security": [
    { label: "Two-factor Authentication", description: "Enable or disable 2FA", type: "toggle" },
    { label: "Login Notifications", description: "Enable or disable login notifications", type: "toggle" },
  ],
  "Battery & Energy": [
    { label: "Battery Threshold", description: "Set the battery alert threshold", type: "number" },
    { label: "Energy Mode", description: "Select between Performance, Eco, or Balanced mode", type: "select", options: ["Performance", "Eco", "Balanced"] },
  ],
  "Alerts": [
    { label: "Low Battery Alert", description: "Set the low battery threshold for alert notifications", type: "number" },
    { label: "High Temperature Alert", description: "Set the high temperature threshold for alert notifications", type: "number" },
  ],
  "Navigation & Autopilot": [
    { label: "Autopilot Mode", description: "Toggle autopilot for route navigation", type: "toggle" },
    { label: "Route Planning", description: "Set preferences for route navigation", type: "select", options: ["Default", "Custom"] },
    { label: "Compass Calibration", description: "Adjust compass calibration settings", type: "select", options: ["Auto", "Manual"] },
  ],
};

const SettingsPage = () => {
  const [activeCategory, setActiveCategory] = useState("Appearance");
  const [activeSetting, setActiveSetting] = useState(null);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setActiveSetting(null); // Reset active setting when changing categories
  };

  const handleSettingChange = (setting) => {
    setActiveSetting(setting);
  };

  return (
    <div className="settings-page">
      {/* Left Sidebar Navigation */}
      <div className="settings-sidebar">
        <h3 className="sidebar-title">Settings</h3>
        <ul>
          {Object.keys(settingsData).map((category) => (
            <li
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={activeCategory === category ? "active" : ""}
            >
              {category}
            </li>
          ))}
        </ul>

        {/* User Profile Section (Bottom Left) */}
        <div className="user-profile">
          <FaUserCircle size={50} />
          <div className="user-info">
            <span className="user-name">LACIS</span>
            <span className="user-email">lacis@ufpa.com</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="settings-content">
        <h2>{activeCategory} Settings</h2>
        <div className="settings-list">
          {settingsData[activeCategory].map((setting, index) => (
            <div
              key={index}
              className="setting-item"
              onClick={() => handleSettingChange(setting.label)}
            >
              <h3>{setting.label}</h3>
              <p>{setting.description}</p>
              {/* Show specific input types based on setting */}
              {setting.type === "color" && <input type="color" />}
              {setting.type === "select" && (
                <select>
                  {setting.options.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
              {setting.type === "number" && <input type="number" />}
              {setting.type === "text" && <input type="text" />}
              {setting.type === "password" && <input type="password" />}
              {setting.type === "toggle" && <input type="checkbox" />}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="cancel-btn">Cancel</button>
          <button className="save-btn">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;