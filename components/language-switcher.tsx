"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/use-language"
import { Globe } from "lucide-react"
import { motion } from "framer-motion"

const languages = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
]

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const currentLang = languages.find((lang) => lang.code === language) || languages[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.3 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full sm:h-10 sm:w-auto sm:rounded-md sm:px-4 bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all"
          >
            <span className="text-base sm:mr-2">{currentLang.flag}</span>
            <span className="hidden sm:inline">{currentLang.name}</span>
            <Globe className="hidden sm:inline h-4 w-4 sm:ml-2 text-primary/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[150px] bg-white/90 backdrop-blur-sm">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`${language === lang.code ? "bg-primary/10 font-medium" : ""} cursor-pointer transition-colors`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}

