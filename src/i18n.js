import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import ptTranslation from './locales/pt/translation.json';

// Tenta obter o idioma guardado no localStorage, senão usa o detector
const savedLanguage = localStorage.getItem('language') || undefined;

i18n
  // Deteta o idioma do utilizador (localStorage, navegador, etc.)
  .use(LanguageDetector)
  // Passa a instância i18n para react-i18next.
  .use(initReactI18next)
  // Inicializa o i18next
  .init({
    debug: true, // Ative para ver logs no console durante o desenvolvimento
    fallbackLng: 'en', // Idioma padrão se o detetado não estiver disponível
    lng: savedLanguage, // Define o idioma inicial (se guardado)
    interpolation: {
      escapeValue: false, // React já faz escaping para prevenir XSS
    },
    resources: {
      en: {
        translation: enTranslation,
      },
      pt: {
        translation: ptTranslation,
      },
      // Adicione outros idiomas aqui
    },
    // Configuração do LanguageDetector
    detection: {
        order: ['localStorage', 'navigator'], // Ordem de deteção
        caches: ['localStorage'], // Onde guardar o idioma detetado
    }
  });

export default i18n;