import { motion } from 'framer-motion';
import { ChevronRight, Moon, Sun, Monitor, Info, Github, Twitter } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../utils/helpers';

/**
 * Settings Screen
 *
 * Features:
 * - Theme toggle (Light/Dark/System)
 * - App info
 * - About section
 * - iOS-style list design
 */

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeOptionConfig {
  value: ThemeOption;
  label: string;
  icon: typeof Sun;
  description: string;
}

const THEME_OPTIONS: ThemeOptionConfig[] = [
  {
    value: 'light',
    label: 'Light',
    icon: Sun,
    description: 'Always use light mode',
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: Moon,
    description: 'Always use dark mode',
  },
  {
    value: 'system',
    label: 'System',
    icon: Monitor,
    description: 'Follow device preference',
  },
];

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-surface-500 dark:text-white/50 px-1 mb-2 uppercase tracking-wide">
        {title}
      </h3>
      <div className="ios-list">{children}</div>
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
}

function SettingsItem({ icon, label, value, onClick, rightElement }: SettingsItemProps) {
  return (
    <motion.button
      className="ios-list-item flex items-center gap-3 w-full text-left"
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-white/10 flex items-center justify-center text-surface-600 dark:text-white/70">
        {icon}
      </div>
      <span className="flex-1 font-medium text-surface-900 dark:text-white">{label}</span>
      {value && <span className="text-sm text-surface-500 dark:text-white/50">{value}</span>}
      {rightElement}
      {!value && !rightElement && <ChevronRight size={18} className="text-surface-400 dark:text-white/30" />}
    </motion.button>
  );
}

export function SettingsView() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = (option: ThemeOption) => {
    setTheme(option);
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-black px-5 pt-12 pb-32 transition-colors duration-300">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Settings</h1>
        <p className="text-surface-500 dark:text-white/50 mt-1">Customize your experience</p>
      </div>

      {/* Appearance Section */}
      <SettingsSection title="Appearance">
        <div className="px-4 py-3">
          <p className="text-sm text-surface-500 dark:text-white/50 mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;

              return (
                <motion.button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 border-primary-500"
                      : "bg-white dark:bg-white/5 border-transparent dark:border-white/10"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isActive
                        ? "bg-primary-500 text-white"
                        : "bg-surface-100 dark:bg-white/10 text-surface-600 dark:text-white/70"
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isActive
                        ? "text-primary-700 dark:text-primary-300"
                        : "text-surface-700 dark:text-white/70"
                    )}
                  >
                    {option.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <p className="text-xs text-surface-400 dark:text-white/40 mt-2">
            {THEME_OPTIONS.find((t) => t.value === theme)?.description}
          </p>
        </div>
      </SettingsSection>

      {/* General Section */}
      <SettingsSection title="General">
        <SettingsItem icon={<Info size={18} />} label="About SubTrack" value="v1.0.0" />
        <SettingsItem icon={<Github size={18} />} label="GitHub" onClick={() => window.open('https://github.com', '_blank')} />
        <SettingsItem icon={<Twitter size={18} />} label="Twitter" onClick={() => window.open('https://twitter.com', '_blank')} />
      </SettingsSection>

      {/* Data Section */}
      <SettingsSection title="Data">
        <SettingsItem
          icon={<span className="text-lg">💾</span>}
          label="Export Data"
          onClick={() => console.log('Export data')}
        />
        <SettingsItem
          icon={<span className="text-lg">🗑️</span>}
          label="Clear All Data"
          onClick={() => {
            if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        />
      </SettingsSection>

      {/* Current Theme Indicator */}
      <div className="mt-8 text-center">
        <p className="text-sm text-surface-400 dark:text-white/40">
          Current theme: <span className="font-medium text-surface-600 dark:text-white/60">{resolvedTheme}</span>
        </p>
      </div>
    </div>
  );
}
