import { useState, useEffect } from 'react'
import { isSupabaseConfigured, getSupabase, getSupabaseSync } from '../lib/supabase'

interface AuthState {
  user: { email: string } | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setState({ user: { email: 'admin@noblenest.com' }, loading: false })
      return
    }

    let sub: any
    getSupabase().then(supabase => {
      if (!supabase) return
      supabase.auth.getSession().then(({ data: { session } }: any) => {
        setState({
          user: session?.user ? { email: session.user.email || '' } : null,
          loading: false,
        })
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        setState({
          user: session?.user ? { email: session.user.email || '' } : null,
          loading: false,
        })
      })
      sub = subscription
    })

    return () => sub?.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      setState({ user: { email }, loading: false })
      return { error: null }
    }
    const supabase = await getSupabase()
    const { error } = await supabase!.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setState({ user: null, loading: false })
      return
    }
    const supabase = getSupabaseSync()
    if (supabase) await supabase.auth.signOut()
  }

  return { ...state, signIn, signOut }
}
