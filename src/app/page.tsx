import { createClient } from '@/lib/supabase/server'
import React from 'react'

export default async function Home() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()

    return <div>{JSON.stringify(data, null, 2)}</div>
}
