"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Check } from "lucide-react"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const setupDatabase = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createBrowserClient()

      // 1. Vérifier si la table existe déjà
      const { error: checkError } = await supabase.from("dog_profiles").select("count").limit(1)

      if (!checkError) {
        setSuccess("La table dog_profiles existe déjà.")
        return
      }

      // 2. Créer la table dog_profiles
      const { error: createError } = await supabase.rpc("create_dog_profiles_table")

      if (createError) {
        // Si la fonction RPC n'existe pas, essayer de créer la table directement via SQL
        const { error: sqlError } = await supabase.rpc("execute_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS dog_profiles (
              id SERIAL PRIMARY KEY,
              dog_name TEXT,
              owner_name TEXT,
              address TEXT,
              phone TEXT,
              primary_color TEXT DEFAULT '#8b5cf6',
              image_url TEXT
            );
          `,
        })

        if (sqlError) {
          throw new Error(`Impossible de créer la table: ${sqlError.message}`)
        }
      }

      // 3. Créer un bucket pour les images
      const { error: storageError } = await supabase.storage.createBucket("dog-images", {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif"],
      })

      if (storageError && !storageError.message.includes("already exists")) {
        throw new Error(`Impossible de créer le bucket de stockage: ${storageError.message}`)
      }

      setSuccess("Configuration terminée avec succès ! Vous pouvez maintenant utiliser l'application.")

      // Rediriger vers la page d'accueil après 2 secondes
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (err) {
      console.error("Setup error:", err)
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configuration de l'application</CardTitle>
          <CardDescription>
            Cette page va configurer la base de données nécessaire pour l'application de médaille de chien.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-500 bg-green-50">
              <Check className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Succès</AlertTitle>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          <p className="mb-4">Cette page va créer :</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>
              La table <code>dog_profiles</code> dans votre base de données Supabase
            </li>
            <li>
              Un bucket de stockage <code>dog-images</code> pour les photos
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Assurez-vous que vos variables d'environnement Supabase sont correctement configurées.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={setupDatabase} disabled={loading || !!success} className="w-full">
            {loading ? "Configuration en cours..." : "Configurer la base de données"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

