import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'
import ProvidersMainLayout from '@/components/Layouts/ProvidersMainLayout'
import { initUserData } from '@/actions/auth'

interface MainLayoutProps {
    children: ReactNode
}

export default async function MainLayout({ children }: MainLayoutProps) {
    const data = await initUserData()

    if (!data) {
        return redirect('/login')
    }

    return (
        <ProvidersMainLayout
            userData={data.user || null}
            teamData={data.team || null}
        >
            {children}
        </ProvidersMainLayout>
    )
}
