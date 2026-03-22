import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

interface AuthState {
  user: { email: string } | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo mode — auto-login
      setState({ user: { email: 'admin@noblenest.com' }, loading: false })
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ? { email: session.user.email || '' } : null,
        loading: false,
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ? { email: session.user.email || '' } : null,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      setState({ user: { email }, loading: false })
      return { error: null }
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setState({ user: null, loading: false })
      return
    }
    await supabase.auth.signOut()
  }

  return { ...state, signIn, signOut }
}
