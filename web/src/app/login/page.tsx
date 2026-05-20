'use client'

import { supabase } from '@/lib/supabase'
import { LogIn } from 'lucide-react'

export const dynamic = 'force-dynamic'

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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] text-[#1A1A1A]">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-[20px] bcc-shadow border border-[#D9D9D9]">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F7EE] text-[#00A859] rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]"></span>
            BCC University
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">AI Mindset Tracker</h2>
          <p className="mt-2 text-sm text-[#8C8C8C]">
            Войдите с помощью GitHub, чтобы продолжить
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-[8px] text-white bg-[#00A859] hover:bg-[#007A40] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A859] transition-colors"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Продолжить с GitHub
          </button>
        </div>
      </div>
    </div>
  )
}
