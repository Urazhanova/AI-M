import { createClient } from '@supabase/supabase-js'

// Placeholder-значения нужны, чтобы build не падал при отсутствии env
// (Supabase — опциональная фича авторизации). Если env пустой — клиент создаётся,
// но любой реальный вызов вернёт auth-ошибку, что корректно для незаконфигуренной среды.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
