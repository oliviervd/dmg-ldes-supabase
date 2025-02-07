import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY

console.log(SUPABASE_URL)
console.log(SUPABASE_KEY)

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY,{
    auth: { persistSession: false },
})
