import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = "https://ptowwsdnovbrvcjtlqdk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0b3d3c2Rub3ZicnZjanRscWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NjQ5ODIsImV4cCI6MjA2NjE0MDk4Mn0.HtKud37z8_O21gj7YxRDNz9xLbBQzx01bYZBbn3RfbI"
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`
    Supabase credentials are missing. Please add the following to your .env.local file:
    
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  `)
}

// Initialize and export the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})