import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// TODO: Restore NotificationSettings when the component is properly exported from useSettings.ts
// import useSettings, { NotificationSettings } from '../hooks/useSettings';
import useSettings from '../hooks/useSettings';
import './Settings.css';
// Individual setting section components
// TODO: Restore NotificationSettings component when the type is properly exported
/*
const NotificationsSection: React.FC<{
  notifications: NotificationSettings;
  onChange: (key: keyof NotificationSettings) => void;
}> = ({ notifications, onChange }) => (
  <section className="settings-section">
    <h3 id="notifications-heading">Notifications</h3>
    <div className="settings-option">
      <label htmlFor="daily-reminder">
        <input
          id="daily-reminder"
          type="checkbox"
          role="switch"
          checked={notifications.dailyReminder}
          onChange={() => onChange('dailyReminder')}
          aria-labelledby="notifications-heading"
        />
        Daily Reminder
      </label>
    </div>
    <div className="settings-option">
      <label htmlFor="game-results">
        <input
          id="game-results"
          type="checkbox"
          role="switch"
          checked={notifications.gameResults}
          onChange={() => onChange('gameResults')}
          aria-labelledby="notifications-heading"
        />
        Game Results
      </label>
    </div>
    <div className="settings-option">
      <label htmlFor="achievements">
        <input
          id="achievements"
          type="checkbox"
          role="switch"
          checked={notifications.achievements}
          onChange={() => onChange('achievements')}
          aria-labelledby="notifications-heading"
        />
        Achievements
      </label>
    </div>
  </section>
);
*/
const ThemeSection = ({ theme, onChange }) => (_jsxs("section", { className: "settings-section", children: [_jsx("h3", { id: "theme-heading", children: "Theme" }), _jsxs("div", { className: "settings-option", children: [_jsx("label", { htmlFor: "theme-select", children: "Theme" }), _jsxs("select", { id: "theme-select", value: theme, onChange: (e) => onChange(e.target.value), "aria-labelledby": "theme-heading", children: [_jsx("option", { value: "light", children: "Light" }), _jsx("option", { value: "dark", children: "Dark" }), _jsx("option", { value: "system", children: "System Default" })] })] })] }));
const LanguageSection = ({ language, onChange }) => (_jsxs("section", { className: "settings-section", children: [_jsx("h3", { id: "language-heading", children: "Language" }), _jsxs("div", { className: "settings-option", children: [_jsx("label", { htmlFor: "language-select", children: "Language" }), _jsxs("select", { id: "language-select", value: language, onChange: (e) => onChange(e.target.value), "aria-labelledby": "language-heading", children: [_jsx("option", { value: "en", children: "English" }), _jsx("option", { value: "es", children: "Spanish" }), _jsx("option", { value: "fr", children: "French" })] })] })] }));
// Settings component
const Settings = ({ onUpdateSuccess }) => {
    const { settings, theme, isLoading, error, isSaved, updateNotificationSetting, updateLanguage, setTheme, resetToDefaults, saveSettingsToAPI } = useSettings();
    const handleSave = async (e) => {
        e.preventDefault();
        await saveSettingsToAPI();
        if (onUpdateSuccess) {
            onUpdateSuccess({
                settings: {
                    ...settings,
                    theme
                }
            });
        }
    };
    return (_jsxs("div", { className: "settings-container", children: [_jsx("h2", { children: "Settings" }), error && (_jsx("div", { className: "error-message", role: "alert", children: error })), isSaved && (_jsx("div", { className: "success-message", role: "status", children: "Settings saved successfully!" })), _jsxs("form", { onSubmit: handleSave, children: [_jsx(ThemeSection, { theme: theme, onChange: setTheme }), _jsx(LanguageSection, { language: settings.language, onChange: updateLanguage }), _jsxs("div", { className: "settings-actions", children: [_jsx("button", { type: "submit", disabled: isLoading, "aria-busy": isLoading, children: isLoading ? 'Saving...' : 'Save Settings' }), _jsx("button", { type: "button", onClick: resetToDefaults, className: "reset-button", "aria-label": "Reset all settings to default values", children: "Reset to Defaults" })] })] })] }));
};
export default Settings;
