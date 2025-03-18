"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserClient } from "@/lib/supabase-client"
import { useTranslation } from "@/hooks/use-translation"
import { motion } from "framer-motion"
import { Dog, LogOut, Save, Download, Upload, Trash2 } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import QRCode from "qrcode.react"
import type { DogProfile } from "@/lib/types"

export function AdminPanel() {
  const { t } = useTranslation()
  const router = useRouter()
  const supabase = createBrowserClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<DogProfile>({
    dogName: "",
    ownerName: "",
    address: "",
    phone: "",
    primaryColor: "#8b5cf6", // Default purple color
    imageUrl: null,
  })

  const [showColorPicker, setShowColorPicker] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState("")

  useEffect(() => {
    // Set the QR URL to the public site
    const baseUrl = window.location.origin
    setQrUrl(baseUrl)

    // Load profile data
    loadProfileData()
  }, [])

  // Modifier la fonction loadProfileData pour s'adapter à la nouvelle structure de réponse

  const loadProfileData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("dog_profiles").select("*").single()

      if (error) {
        throw error
      }

      if (data) {
        setProfile(data)
        if (data.imageUrl) {
          setImagePreview(data.imageUrl)
        }
      } else {
        // Initialiser avec des valeurs par défaut si aucun profil n'existe
        console.log("No profile found, using defaults")
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      // Ne pas modifier l'état du profil en cas d'erreur
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Update or insert the profile
      const { error } = await supabase.from("dog_profiles").upsert(profile, { onConflict: "id" })

      if (error) {
        throw error
      }

      toast({
        title: t("save_success"),
        description: t("profile_updated"),
      })
    } catch (error: any) {
      toast({
        title: t("save_error"),
        description: error.message || t("unknown_error"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview the image
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Supabase Storage
    setLoading(true)
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { data, error } = await supabase.storage.from("dog-images").upload(fileName, file, { upsert: true })

      if (error) {
        throw error
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("dog-images").getPublicUrl(data.path)

      // Update the profile with the new image URL
      setProfile({
        ...profile,
        imageUrl: publicUrl,
      })

      toast({
        title: t("upload_success"),
        description: t("image_updated"),
      })
    } catch (error: any) {
      toast({
        title: t("upload_error"),
        description: error.message || t("unknown_error"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!profile.imageUrl) return

    setLoading(true)
    try {
      // Extract the file name from the URL
      const fileName = profile.imageUrl.split("/").pop()

      if (fileName) {
        // Delete from storage
        const { error } = await supabase.storage.from("dog-images").remove([fileName])

        if (error) {
          throw error
        }
      }

      // Update profile
      setProfile({
        ...profile,
        imageUrl: null,
      })
      setImagePreview(null)

      toast({
        title: t("remove_success"),
        description: t("image_removed"),
      })
    } catch (error: any) {
      toast({
        title: t("remove_error"),
        description: error.message || t("unknown_error"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement
    if (!canvas) return

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")

    const downloadLink = document.createElement("a")
    downloadLink.href = pngUrl
    downloadLink.download = `${profile.dogName || "dog"}-qrcode.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <Dog className="h-6 w-6" />
          {t("admin_panel")}
        </h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          {t("logout")}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">{t("profile")}</TabsTrigger>
          <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("dog_profile")}</CardTitle>
              <CardDescription>{t("update_dog_info")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dogName">{t("dog_name")}</Label>
                  <Input
                    id="dogName"
                    value={profile.dogName}
                    onChange={(e) => setProfile({ ...profile, dogName: e.target.value })}
                    placeholder="Taïka"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">{t("owner_name")}</Label>
                  <Input
                    id="ownerName"
                    value={profile.ownerName}
                    onChange={(e) => setProfile({ ...profile, ownerName: e.target.value })}
                    placeholder="Alexandre CARTON"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t("address")}</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="36 rue du Général Leclerc, 55130 Treveray"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+33672659121"
                />
                <p className="text-xs text-muted-foreground">{t("phone_format")}</p>
              </div>

              <div className="space-y-2">
                <Label>{t("dog_image")}</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    {imagePreview ? (
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt={profile.dogName || "Dog"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Dog className="h-12 w-12 text-primary/40" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      {t("upload_image")}
                    </Button>
                    {imagePreview && (
                      <Button variant="outline" size="sm" onClick={handleRemoveImage}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("remove_image")}
                      </Button>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {loading ? t("saving") : t("save_changes")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>{t("appearance")}</CardTitle>
              <CardDescription>{t("customize_appearance")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("primary_color")}</Label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-md cursor-pointer border-2"
                    style={{ backgroundColor: profile.primaryColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  <Input
                    value={profile.primaryColor}
                    onChange={(e) => setProfile({ ...profile, primaryColor: e.target.value })}
                    className="w-32"
                  />
                </div>

                {showColorPicker && (
                  <div className="mt-2 p-3 bg-white rounded-md shadow-md">
                    <HexColorPicker
                      color={profile.primaryColor}
                      onChange={(color) => setProfile({ ...profile, primaryColor: color })}
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={loading} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {loading ? t("saving") : t("save_changes")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qrcode">
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>{t("qr_code_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                <QRCode
                  id="qr-code"
                  value={qrUrl}
                  size={200}
                  level="H"
                  includeMargin={true}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>
              <p className="text-sm text-center text-muted-foreground mb-4">{t("qr_code_instructions")}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={downloadQRCode} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                {t("download_qr")}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </motion.div>
  )
}

