'use client'
import supabase from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/schema'
import { User } from '@supabase/supabase-js'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    team: Database['public']['Tables']['teams']['Row']
}

const AuthContext = createContext({})

export function AuthContextProvider({
    children,
    userData,
    teamData,
}: {
    children: React.ReactNode
    userData: AuthContextType['user'] | null
    teamData: AuthContextType['team'] | null
}) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(userData)
    const [team, setTeam] = useState<
        Database['public']['Tables']['teams']['Row'] | null
    >(teamData)
    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(event, session)
            if (event === 'SIGNED_OUT') {
                router.push('/login')
                setUser(null)
                setTeam(null)
            }
        })
    })

    return (
        <AuthContext.Provider
            value={{
                user,
                team,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext) as AuthContextType
