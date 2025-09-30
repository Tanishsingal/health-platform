"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import enTranslations from '../messages/en.json'
import hiTranslations from '../messages/hi.json'
import taTranslations from '../messages/ta.json'
import teTranslations from '../messages/te.json'
import bnTranslations from '../messages/bn.json'
import mrTranslations from '../messages/mr.json'
import guTranslations from '../messages/gu.json'

export type Locale = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'gu'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  mr: 'मराठी',
  gu: 'ગુજરાતી',
}

type Translations = Record<string, any>

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, defaultValue?: string) => string
  translations: Translations
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

const translationsMap: Record<Locale, Translations> = {
  en: enTranslations,
  hi: hiTranslations,
  ta: taTranslations,
  te: teTranslations,
  bn: bnTranslations,
  mr: mrTranslations,
  gu: guTranslations,
}

function loadTranslations(locale: Locale): Translations {
  return translationsMap[locale] || translationsMap.en
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [translations, setTranslations] = useState<Translations>({})

  useEffect(() => {
    // Load locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && Object.keys(localeNames).includes(savedLocale)) {
      setLocaleState(savedLocale)
    }
  }, [])

  useEffect(() => {
    // Load translations when locale changes
    setTranslations(loadTranslations(locale))
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = (key: string, defaultValue: string = key): string => {
    const keys = key.split('.')
    let value: any = translations

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return defaultValue
      }
    }

    return typeof value === 'string' ? value : defaultValue
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, translations }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslations(namespace?: string) {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslations must be used within I18nProvider')
  }

  if (namespace) {
    return (key: string, defaultValue?: string) => context.t(`${namespace}.${key}`, defaultValue)
  }

  return context.t
}

export function useLocale() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLocale must be used within I18nProvider')
  }

  return { locale: context.locale, setLocale: context.setLocale }
} 