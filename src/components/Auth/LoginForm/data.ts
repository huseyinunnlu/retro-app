import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'

export interface LoginFormTypes {
    email: string
    password: string
}

export const loginFormSchema = zodResolver(
    z.object({
        email: z.email(),
        password: z.string().min(6).max(100),
    }),
)
