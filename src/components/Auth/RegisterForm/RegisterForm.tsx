'use client'

import { useForm } from 'react-hook-form'
import { TextInputField } from '@/components/Shared/Form/TextInputField'
import { Form } from '@/components/ui/form'
import { registerSchema, RegisterFormTypes } from './data'
import { register } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function RegisterForm() {
    const router = useRouter()
    const form = useForm<RegisterFormTypes>({
        defaultValues: {
            email: `test${Math.random()}@test.com`,
            firstName: 'Test',
            lastName: 'Test',
            password: 'Test12..',
            confirmPassword: 'Test12..',
        },
        resolver: registerSchema,
    })

    const handleSubmit = async (formData: RegisterFormTypes) => {
        const { error } = await register(formData)

        if (error) {
            toast.warning('Registration failed, please try again!')
            return
        }

        toast.success('Registeration successful.')
        router.push('/')
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="grid grid-cols-2 gap-4 w-2/3 max-sm:w-full"
            >
                <TextInputField
                    control={form.control}
                    name="firstName"
                    label="First Name"
                    placeholder="First Name"
                    className="col-span-1"
                />
                <TextInputField
                    control={form.control}
                    name="lastName"
                    label="Last Name"
                    placeholder="Last Name"
                    className="col-span-1"
                />
                <TextInputField
                    control={form.control}
                    name="email"
                    label="Email"
                    placeholder="Email"
                    className="col-span-2"
                />
                <TextInputField
                    control={form.control}
                    name="password"
                    label="Password"
                    placeholder="Password"
                    className="col-span-1"
                />
                <TextInputField
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm Password"
                    className="col-span-1"
                />
                <Button
                    disabled={form.formState.isSubmitting}
                    type="submit"
                    className="col-span-2"
                >
                    {form.formState.isSubmitting
                        ? 'Registering...'
                        : 'Register'}
                </Button>
            </form>
        </Form>
    )
}
