interface AuthLayoutProps {
    children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="md:grid md:grid-cols-2 w-screen h-screen">
            <div className="grid-span-1 bg-auth-background"></div>
            <div className="grid-span-1 w-full h-full">{children}</div>
        </div>
    )
}
