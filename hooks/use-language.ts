"use client"

import { useContext } from "react"
import { I18nContext } from "@/components/i18n-provider"

export function useLanguage() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error("useLanguage must be used within an I18nProvider")
  }

  return {
    language: context.language,
    setLanguage: context.setLanguage,
  }
}

