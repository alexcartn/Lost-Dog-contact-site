"use client"

import type React from "react"

import { createContext, useEffect, useState } from "react"
import { translations } from "@/lib/translations"

export const I18nContext = createContext({
  language: "fr",
  setLanguage: (lang: string) => {},
  t: (key: string) => "",
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("fr")

  useEffect(() => {
    // Try to get language from localStorage or browser settings
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage)
    } else {
      // Get browser language
      const browserLang = navigator.language.split("-")[0]
      if (Object.keys(translations).includes(browserLang)) {
        setLanguage(browserLang)
      }
    }
  }, [])

  useEffect(() => {
    // Save language preference
    localStorage.setItem("language", language)
    // Update html lang attribute
    document.documentElement.lang = language
  }, [language])

  const t = (key: string) => {
    return translations[language]?.[key] || translations.en[key] || key
  }

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
}

