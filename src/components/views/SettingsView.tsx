import React, { useState, useRef } from 'react';
import {
  Settings,
  Globe,
  Coins,
  Database,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Shield,
  Download,
  Upload,
  Sun,
  Moon,
  Laptop,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme, Theme } from '../../context/ThemeContext';
import { Language } from '../../i18n/translations';

export const SettingsView: React.FC = () => {
  const { loadDemoData, clearAllData, exportDataJSON, importDataJSON } = useFinance();
  const { language, setLanguage, t, strings } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    showNotification(
      lang === 'uz'
        ? "Til O'zbek tiliga o'zgartirildi"
        : lang === 'ru'
        ? 'Язык изменён на Русский'
        : 'Language changed to English'
    );
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleExport = () => {
    try {
      const dataStr = exportDataJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `oila-moliya-zaxira-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showNotification(t('settings_import_success'));
    } catch {
      showNotification('Eksport qilishda xatolik yuz berdi', 'error');
    }
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const success = importDataJSON(content);
        if (success) {
          showNotification(t('settings_import_success'), 'success');
        } else {
          showNotification(t('settings_import_error'), 'error');
        }
      }
    };
    reader.onerror = () => {
      showNotification(t('settings_import_error'), 'error');
    };
    reader.readAsText(file);
    if (event.target) event.target.value = '';
  };

  const handleLoadDemo = () => {
    if (window.confirm(t('settings_demo_confirm'))) {
      loadDemoData();
      showNotification("Demo ma'lumotlar yuklandi!", 'success');
    }
  };

  const handleClearAll = () => {
    if (window.confirm(t('settings_clear_confirm'))) {
      clearAllData();
      showNotification("Barcha ma'lumotlar tozalandi!", 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>{t('settings_title')}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('settings_title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('settings_desc')}
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 1. Language Preference */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('settings_language')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('settings_language_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Uzbek */}
          <button
            type="button"
            onClick={() => handleLanguageChange('uz')}
            className={`min-h-[52px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              language === 'uz'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🇺🇿</span>
              <span className="font-semibold text-sm">Oʻzbekcha</span>
            </div>
            {language === 'uz' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </button>

          {/* Russian */}
          <button
            type="button"
            onClick={() => handleLanguageChange('ru')}
            className={`min-h-[52px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              language === 'ru'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🇷🇺</span>
              <span className="font-semibold text-sm">Русский</span>
            </div>
            {language === 'ru' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </button>

          {/* English */}
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`min-h-[52px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              language === 'en'
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🇬🇧</span>
              <span className="font-semibold text-sm">English</span>
            </div>
            {language === 'en' && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
          </button>
        </div>
      </div>

      {/* 2. Theme Selection */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('settings_theme')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('settings_theme_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Light Mode */}
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`min-h-[52px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'light'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-sm">{t('settings_theme_light')}</span>
            </div>
            {theme === 'light' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          </button>

          {/* Dark Mode */}
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`min-h-[52px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'dark'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Moon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <span className="font-semibold text-sm">{t('settings_theme_dark')}</span>
            </div>
            {theme === 'dark' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          </button>

          {/* System Mode */}
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`min-h-[52px] p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              theme === 'system'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-950 dark:text-amber-200 ring-2 ring-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Laptop className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <span className="font-semibold text-sm">{t('settings_theme_system')}</span>
            </div>
            {theme === 'system' && <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          </button>
        </div>
      </div>

      {/* 3. Base Currency */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{t('settings_currency')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('settings_currency_desc')}</div>
            </div>
          </div>
          <span className="px-3.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
            UZS (soʻm)
          </span>
        </div>
      </div>

      {/* 4. Data Management & Privacy */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('settings_data_management')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t('settings_data_management_desc')}
            </p>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t('settings_privacy_note')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExport}
            className="min-h-[48px] px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t('btn_export')}</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[48px] px-4 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t('btn_import')}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />

          {/* Load Demo Data */}
          <button
            type="button"
            onClick={handleLoadDemo}
            className="min-h-[48px] px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>{t('btn_load_demo')}</span>
          </button>

          {/* Clear All Data */}
          <button
            type="button"
            onClick={handleClearAll}
            className="min-h-[48px] px-4 py-3 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-sm font-semibold flex items-center justify-center gap-2.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('btn_clear_all')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
