'use server'

import { LoginFormTypes } from '@/components/Auth/LoginForm/data'
import { RegisterFormTypes } from '@/components/Auth/RegisterForm/data'
import { createClient } from '@/lib/supabase/server'

export async function register(formData: RegisterFormTypes) {
    const supabase = await createClient()
    return await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                firstName: formData.firstName,
                lastName: formData.lastName,
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
