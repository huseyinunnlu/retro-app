import Link from 'next/link'
import LoginForm from '@/components/Auth/LoginForm/LoginForm'

export default function Login() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <h2 className="text-3xl font-semibold">Login</h2>
            <p className="flex gap-x-2 font-semibold text-muted-foreground">
                Don&apos;t have an account?
                <Link className="text-primary underline" href="/register">
                    Login
                </Link>
            </p>
            <LoginForm />
        </div>
    )
}
