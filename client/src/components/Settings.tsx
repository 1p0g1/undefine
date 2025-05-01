import React from 'react';
// TODO: Restore NotificationSettings when the component is properly exported from useSettings.ts
// import useSettings, { NotificationSettings } from '../hooks/useSettings';
import useSettings from '../hooks/useSettings';
import type { Theme } from '../hooks/useTheme';
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

const ThemeSection: React.FC<{
  theme: Theme;
  onChange: (theme: Theme) => void;
}> = ({ theme, onChange }) => (
  <section className="settings-section">
    <h3 id="theme-heading">Theme</h3>
    <div className="settings-option">
      <label htmlFor="theme-select">Theme</label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => onChange(e.target.value as Theme)}
        aria-labelledby="theme-heading"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System Default</option>
      </select>
    </div>
  </section>
);

const LanguageSection: React.FC<{
  language: string;
  onChange: (language: string) => void;
}> = ({ language, onChange }) => (
  <section className="settings-section">
    <h3 id="language-heading">Language</h3>
    <div className="settings-option">
      <label htmlFor="language-select">Language</label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => onChange(e.target.value)}
        aria-labelledby="language-heading"
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
      </select>
    </div>
  </section>
);

// Settings component
const Settings: React.FC<{
  onUpdateSuccess?: (data: any) => void;
}> = ({ onUpdateSuccess }) => {
  const {
    settings,
    theme,
    isLoading,
    error,
    isSaved,
    updateNotificationSetting,
    updateLanguage,
    setTheme,
    resetToDefaults,
    saveSettingsToAPI
  } = useSettings();

  const handleSave = async (e: React.FormEvent) => {
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
  
  return (
    <div className="settings-container">
      <h2>Settings</h2>
      
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
      
      {isSaved && (
        <div className="success-message" role="status">
          Settings saved successfully!
        </div>
      )}
      
      <form onSubmit={handleSave}>
        {/* TODO: Restore NotificationSettings component when properly exported */}
        {/* <NotificationsSection 
          notifications={settings.notifications} 
          onChange={updateNotificationSetting}
        /> */}
        
        <ThemeSection 
          theme={theme} 
          onChange={setTheme}
        />
        
        <LanguageSection 
          language={settings.language} 
          onChange={updateLanguage}
        />
        
        <div className="settings-actions">
          <button 
            type="submit" 
            disabled={isLoading} 
            aria-busy={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          
          <button 
            type="button" 
            onClick={resetToDefaults}
            className="reset-button"
            aria-label="Reset all settings to default values"
          >
            Reset to Defaults
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 