const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'))

export const isSupabaseConfigured = () => isConfigured

// Lazy-load the Supabase client only when credentials exist
let _supabase: any = null

export const getSupabase = async () => {
  if (!isConfigured) return null
  if (!_supabase) {
    const { createClient } = await import('@supabase/supabase-js')
    _supabase = createClient(supabaseUrl, supabaseAnonKey)
  }
  return _supabase
}

// For auth listener (needs sync access after first init)
export const getSupabaseSync = () => _supabase
