'use client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ContextLayoutProps {
    children: React.ReactNode
}

const queryClient = new QueryClient()

export default function ContextLayout({ children }: ContextLayoutProps) {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
