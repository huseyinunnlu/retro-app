'use server'

import { LoginFormTypes } from '@/components/Auth/LoginForm/data'
import { RegisterFormTypes } from '@/components/Auth/RegisterForm/data'
import { createClient } from '@/lib/supabase/server'

async function createTeam() {
    const supabase = await createClient()
    return await supabase
        .from('teams')
        .insert({
            name: `Team-${Math.random()}`,
        })
        .select()
        .single()
}

export async function getTeamByInviteToken(token: string) {
    const supabase = await createClient()
    return await supabase
        .from('teams')
        .select('*')
        .eq('invite_token', token)
        .single()
}

export async function register(
    formData: RegisterFormTypes,
    token: string | null,
) {
    const supabase = await createClient()
    let teamResult

    if (token) {
        teamResult = await getTeamByInviteToken(token)

        if (!teamResult.data) {
            return {
                error: {
                    message: 'Invalid token',
                },
                data: null,
            }
        }
    } else {
        teamResult = await createTeam()
    }
    if (teamResult.error) {
        return teamResult
    }

    return await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: token ? 'user' : 'admin',
                team_id: teamResult.data?.id,
                profile_picture: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}`,
            },
        },
    })
}

export async function login(formData: LoginFormTypes) {
    const supabase = await createClient()
    return await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
    })
}

export async function getTeam(teamId: string) {
    const supabase = await createClient()
    return await supabase.from('teams').select('*').eq('id', teamId).single()
}

export async function initUserData() {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getUser()
    const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', user?.user?.user_metadata.team_id)
        .single()

    if (!team || !user) {
        return null
    }

    return { user: user.user, team }
}

export async function validateInviteToken(token: string) {
    const supabase = await createClient()
    const teamResult = await supabase
        .from('teams')
        .select('*')
        .eq('invite_token', token)
        .single()

    return {
        isValid: !!teamResult.data,
        team: teamResult.data,
        error: teamResult.error,
    }
}
