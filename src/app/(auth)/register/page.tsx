import RegisterForm from '@/components/Auth/RegisterForm/RegisterForm'
import Link from 'next/link'

export default function Register() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
            <h2 className="text-3xl font-semibold">Register</h2>
            <p className="flex gap-x-2 font-semibold text-muted-foreground">
                Already have an account?
                <Link className="text-primary underline" href="/login">
                    Login
                </Link>
            </p>
            <RegisterForm />
        </div>
    )
}
