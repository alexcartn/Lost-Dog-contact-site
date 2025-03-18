import { createServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createServerClient()

    // Créer la fonction RPC pour créer la table
    const { error: rpcError } = await supabase.rpc("create_function", {
      function_name: "create_dog_profiles_table",
      function_definition: `
        BEGIN
          CREATE TABLE IF NOT EXISTS dog_profiles (
            id SERIAL PRIMARY KEY,
            dog_name TEXT,
            owner_name TEXT,
            address TEXT,
            phone TEXT,
            primary_color TEXT DEFAULT '#8b5cf6',
            image_url TEXT
          );
          RETURN TRUE;
        END;
      `,
      return_type: "boolean",
    })

    if (rpcError) {
      console.error("Error creating RPC function:", rpcError)
      return NextResponse.json({ error: rpcError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

