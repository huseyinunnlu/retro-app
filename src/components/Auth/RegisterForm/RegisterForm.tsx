'use client'

import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { TextInputField } from '@/components/Shared/Form/TextInputField'
import { Form } from '@/components/ui/form'
import { registerSchema, RegisterFormTypes } from './data'

export default function RegisterForm() {
    const form = useForm<RegisterFormTypes>({
        defaultValues: {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            confirmPassword: '',
        },
        resolver: registerSchema,
    })

    const onSubmit = (data: RegisterFormTypes) => {
        console.log(data)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
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
                <Button type="submit" className="col-span-2">
                    Submit
                </Button>
            </form>
        </Form>
    )
}
