import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

export const createClient = () => {
  // Check if environment variables are available
  if (
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL !== "string" ||
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "string"
  ) {
    console.error("Missing Supabase environment variables. Please check your .env file or environment configuration.")
  }

  return createClientComponentClient<Database>({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
}
