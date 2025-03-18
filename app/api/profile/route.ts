import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Vérifier que les variables d'environnement sont définies
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are not defined");
      return NextResponse.json(
        {
          error: "Configuration error",
          message: "Supabase environment variables are missing",
          data: null,
        },
        { status: 500 }
      );
    }

    // Créer le client Supabase
    const supabase = supabaseServer();

    // Vérifier si la table "dog_profiles" existe
    const { data: tableCheck, error: tableError } = await supabase
      .from("dog_profiles")
      .select("count")
      .limit(1)
      .single();

    if (tableError) {
      console.error("Error checking table:", tableError);

      // Si l'erreur est liée à une table inexistante, renvoyer un message spécifique
      if (tableError.code === "PGRST116") {
        return NextResponse.json(
          {
            error: "Table not found",
            message: "The dog_profiles table does not exist. Please create it first.",
            data: null,
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Database error",
          message: tableError.message,
          details: tableError,
          data: null,
        },
        { status: 500 }
      );
    }

    // Récupérer les données du profil
    const { data, error } = await supabase.from("dog_profiles").select("*").maybeSingle(); // Utiliser maybeSingle au lieu de single

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          error: "Database error",
          message: error.message,
          details: error,
          data: null,
        },
        { status: 500 }
      );
    }

    // Renvoyer les données (même si null)
    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Unhandled error in profile API:", error);
    return NextResponse.json(
      {
        error: "Server error",
        message: error instanceof Error ? error.message : String(error),
        data: null,
      },
      { status: 500 }
    );
  }
}
