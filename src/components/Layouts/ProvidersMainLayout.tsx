'use client'
import React, { ReactNode } from 'react'
import { Database } from '@/lib/supabase/schema'
import { User } from '@supabase/supabase-js'
import { AuthContextProvider } from '@/contexts/AuthContext'

interface ContextLayoutProps {
    children: ReactNode
    userData: User | null
    teamData: Database['public']['Tables']['teams']['Row'] | null
}

export default function ProvidersMainLayout({
    children,
    userData,
    teamData,
}: ContextLayoutProps) {
    return (
        <AuthContextProvider userData={userData} teamData={teamData}>
            {children}
        </AuthContextProvider>
    )
}
