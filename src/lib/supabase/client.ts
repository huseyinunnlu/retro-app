'use client'

import { createBrowserClient } from '@supabase/ssr'
import { Database } from './schema'

function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
}

const supabase = createClient()

export default supabase
