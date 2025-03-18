import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = createServerSupabaseClient();
  const { data: user, error } = await supabase.auth.getUser();

  if (error) return <div>Erreur: {error.message}</div>;

  return <div>Utilisateur : {user?.email ?? "Non connecté"}</div>;
}


