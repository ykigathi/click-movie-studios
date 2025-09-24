import { supabaseUrl, supabaseAnonKey } from './info'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)