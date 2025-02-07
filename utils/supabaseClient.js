import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL not set')
}

export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
