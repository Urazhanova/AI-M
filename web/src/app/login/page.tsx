'use client'

import { supabase } from '@/lib/supabase'
import { Github } from 'lucide-react'

export default function LoginPage() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-zinc-900 rounded-2xl shadow-xl border border-zinc-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">AI Mindset Tracker</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Войдите с помощью GitHub, чтобы продолжить
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-black bg-white hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 focus:ring-offset-zinc-900 transition-colors"
          >
            <Github className="w-5 h-5 mr-2" />
            Продолжить с GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
