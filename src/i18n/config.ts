import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import common from './locales/en/common.json'
import settings from './locales/en/settings.json'
import player from './locales/en/player.json'
import course from './locales/en/course.json'
import round from './locales/en/round.json'
import history from './locales/en/history.json'
import stats from './locales/en/stats.json'
import importExport from './locales/en/import-export.json'

const resources = {
  en: {
    common,
    settings,
    player,
    course,
    round,
    history,
    stats,
    'import-export': importExport,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
