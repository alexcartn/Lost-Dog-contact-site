"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, MapPin, Heart, Dog, AlertTriangle } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import type { DogProfile } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export function DogContactCard() {
  const { t } = useTranslation()
  const [isAnimating, setIsAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<DogProfile>({
    dogName: "Mon chien",
    ownerName: "Propriétaire",
    address: "Adresse",
    phone: "+33600000000",
    primaryColor: "#8b5cf6",
    imageUrl: null,
  })
  const [primaryColor, setPrimaryColor] = useState("#8b5cf6") // Default purple

  useEffect(() => {
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching profile data...")
        const response = await fetch("/api/profile")

        // Vérifier si la réponse est OK
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`HTTP error! Status: ${response.status}, Response:`, errorText)

          // Essayer de parser le texte comme JSON si possible
          try {
            const errorJson = JSON.parse(errorText)
            throw new Error(`${errorJson.error || errorJson.message || `HTTP error! Status: ${response.status}`}`)
          } catch (e) {
            // Si le parsing échoue, utiliser le texte brut
            throw new Error(`HTTP error! Status: ${response.status}`)
          }
        }

        const result = await response.json()
        console.log("Profile API response:", result)

        // Vérifier si la réponse contient une erreur
        if (result.error) {
          console.error("API error:", result.error)
          throw new Error(result.error.message || result.error)
        }

        // Extraire les données du profil
        const profileData = result.data

        if (profileData) {
          console.log("Profile data found:", profileData)
          setProfile(profileData)
          if (profileData.primaryColor) {
            setPrimaryColor(profileData.primaryColor)
            // Update CSS variables for the theme color
            document.documentElement.style.setProperty("--primary-color", profileData.primaryColor)
            // Update the hsl values for Tailwind
            updateHslVariables(profileData.primaryColor)
          }
        } else {
          console.log("No profile data found, using defaults")
          // Garder les valeurs par défaut
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError(err instanceof Error ? err.message : String(err))
        // Ne pas modifier le profil par défaut en cas d'erreur
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  // Convert hex color to HSL for Tailwind CSS variables
  const updateHslVariables = (hexColor: string) => {
    try {
      // Convert hex to RGB
      const r = Number.parseInt(hexColor.slice(1, 3), 16) / 255
      const g = Number.parseInt(hexColor.slice(3, 5), 16) / 255
      const b = Number.parseInt(hexColor.slice(5, 7), 16) / 255

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h = 0,
        s = 0,
        l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }

      // Convert to HSL degrees, percentage, percentage
      h = Math.round(h * 360)
      s = Math.round(s * 100)
      l = Math.round(l * 100)

      // Update CSS variables
      document.documentElement.style.setProperty("--primary", `${h} ${s}% ${l}%`)
    } catch (err) {
      console.error("Error updating HSL variables:", err)
      // Utiliser la couleur par défaut en cas d'erreur
      document.documentElement.style.setProperty("--primary", "262 83% 58%")
    }
  }

  // Handler functions
  const handleCall = () => {
    if (profile?.phone) {
      window.location.href = `tel:${profile.phone}`
    }
  }

  const handleWhatsApp = () => {
    if (profile?.phone) {
      window.location.href = `https://wa.me/${profile.phone.replace(/\+/g, "")}`
    }
  }

  const handleMaps = () => {
    if (profile?.address) {
      window.location.href = `https://maps.google.com/?q=${encodeURIComponent(profile.address)}`
    }
  }

  // Handle dog icon interaction
  const handleDogInteraction = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 2000)
  }

  if (loading) {
    return (
      <div className="w-full max-w-md flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full max-w-md z-10"
    >
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Link href="/setup" className="text-primary underline">
                Configurer la base de données
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-primary/20 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 -ml-10 -mb-10 bg-primary/10 rounded-full blur-2xl"></div>

        {/* Header with title and image */}
        <CardHeader className="text-center relative z-10">
          <motion.div
            className="mx-auto mb-4 relative cursor-pointer group"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            onHoverStart={() => setIsAnimating(true)}
            onHoverEnd={() => setIsAnimating(false)}
            onTap={handleDogInteraction}
            onClick={handleDogInteraction}
            whileHover={{ scale: 1.1 }}
            animate={
              isAnimating
                ? {
                    rotate: [0, -5, 5, -5, 0],
                    transition: {
                      rotate: { duration: 0.5, ease: "easeInOut", repeat: 3, repeatType: "mirror" },
                    },
                  }
                : {}
            }
          >
            <div
              className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 ${
                isAnimating ? "bg-primary/20 shadow-lg" : "bg-primary/10"
              }`}
            >
              {profile.imageUrl ? (
                <img
                  src={profile.imageUrl || "/placeholder.svg"}
                  alt={profile.dogName}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-6xl">🐶</span>
              )}
            </div>
            {isAnimating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-md text-primary font-medium text-sm whitespace-nowrap"
              >
                {profile.dogName} 💜
              </motion.div>
            )}
          </motion.div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary mb-2">{t("title")}</CardTitle>
          <CardDescription className="text-lg">{t("message")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {/* Dog Information Section */}
          <motion.div
            className="space-y-3 bg-primary/5 p-4 rounded-lg"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Dog className="h-5 w-5 text-primary" />
              {profile.dogName}
            </h3>
          </motion.div>

          {/* Owner Information Section */}
          <motion.div
            className="space-y-3 bg-secondary/50 p-4 rounded-lg"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <h3 className="font-medium text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" fill="currentColor" />
              {profile.ownerName} <span className="text-sm text-muted-foreground">({t("owner_info")})</span>
            </h3>
            <div>
              <div className="font-medium text-sm">{t("address")}:</div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-1" />
                <span className="text-sm">{profile.address}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full sm:w-auto transition-all hover:bg-primary/10"
                onClick={handleMaps}
              >
                <MapPin className="mr-2 h-4 w-4" />
                {t("view_on_map")}
              </Button>
            </div>
          </motion.div>

          {/* Contact Information Section */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h3 className="font-medium text-primary">{t("phone")}</h3>
            <div className="text-xl font-medium text-primary flex items-center justify-center p-3 bg-primary/5 rounded-lg">
              {profile.phone}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <Button className="w-full transition-all hover:translate-y-[-2px]" onClick={handleCall} size="lg">
                <Phone className="mr-2 h-4 w-4" />
                {t("call_now")}
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 transition-all hover:bg-primary/10 hover:translate-y-[-2px]"
                onClick={handleWhatsApp}
                size="lg"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t("send_message")}
              </Button>
            </div>
          </motion.div>
        </CardContent>

        {/* Footer with QR code message */}
        <CardFooter className="flex flex-col text-center text-sm text-muted-foreground pt-2 pb-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="w-full"
          >
            {t("developed_with_love")}
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

