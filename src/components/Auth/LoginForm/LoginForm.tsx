'use client'

import { useForm } from 'react-hook-form'
import { TextInputField } from '@/components/Shared/Form/TextInputField'
import { Form } from '@/components/ui/form'
import { LoginFormTypes, loginFormSchema } from './data'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { login } from '@/actions/auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function LoginForm() {
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const form = useForm<LoginFormTypes>({
        defaultValues: {
            email: `test@test.com`,
            password: 'Test12..',
        },
        resolver: loginFormSchema,
    })

    const handleSubmit = async (formData: LoginFormTypes) => {
        setError(null)
        const { error } = await login(formData)

        if (error) {
            setError(error.message)
            toast.warning('Login failed!')
            return
        }

        toast.success('Login successful.')
        router.push('/')
    }

    useEffect(() => {
        if (error) {
            window.setTimeout(() => {
                setError(null)
            }, 5000)
        }
    }, [error])

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="grid grid-cols-1 gap-4 w-2/3 max-sm:w-full"
            >
                {error ? (
                    <Alert variant="destructive">
                        <AlertCircle />
                        <AlertTitle>Login failed!</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}
                <TextInputField
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="Email"
                />
                <TextInputField
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="Password"
                />
                <Button disabled={form.formState.isSubmitting} type="submit">
                    {form.formState.isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        'Login'
                    )}
                </Button>
            </form>
        </Form>
    )
}
