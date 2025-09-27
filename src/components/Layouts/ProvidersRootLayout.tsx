'use client'
import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ContextLayoutProps {
    children: ReactNode
}

const queryClient = new QueryClient()

export default function ProvidersRootLayout({ children }: ContextLayoutProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
