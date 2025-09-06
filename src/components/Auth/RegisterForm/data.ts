import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'

export interface RegisterFormTypes {
    email: string
    firstName: string
    lastName: string
    password: string
    confirmPassword: string
}

export const registerSchema = zodResolver(
    z
        .object({
            email: z.email(),
            firstName: z.string().min(1).max(100),
            lastName: z.string().min(1).max(10),
            password: z.string().min(1),
            confirmPassword: z.string().min(1),
        })
        .refine((data) => data.password === data.confirmPassword, {
            path: ['confirmPassword'],
            message: 'Passwords do not match',
        }),
)
