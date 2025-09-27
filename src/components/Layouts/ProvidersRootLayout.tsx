'use client'
import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface ContextLayoutProps {
    children: ReactNode
}

const queryClient = new QueryClient()

export default function ProvidersRootLayout({ children }: ContextLayoutProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <DndProvider backend={HTML5Backend}>{children}</DndProvider>
        </QueryClientProvider>
    )
}
