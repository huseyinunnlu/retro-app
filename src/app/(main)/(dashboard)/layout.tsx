import { redirect } from 'next/navigation'
import React, { ReactNode } from 'react'
import ProvidersMainLayout from '@/components/Layouts/ProvidersMainLayout'
import { initUserData } from '@/actions/auth'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/Layouts/Main/Sidebar'
import Header from '@/components/Layouts/Main/Header'

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
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Header />
                    <div className="container p-4">{children}</div>
                </SidebarInset>
            </SidebarProvider>
        </ProvidersMainLayout>
    )
}
