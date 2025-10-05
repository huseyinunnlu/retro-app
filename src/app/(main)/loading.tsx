import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="flex h-screen w-full">
            {/* Sidebar skeleton */}
            <div className="w-64 border-r bg-sidebar p-4 space-y-4">
                <Skeleton className="h-10 w-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>

            {/* Main content skeleton */}
            <div className="flex-1 p-6 space-y-6">
                <Skeleton className="h-12 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Skeleton className="h-52 w-full" />
                    <Skeleton className="h-52 w-full" />
                    <Skeleton className="h-52 w-full" />
                </div>
            </div>
        </div>
    )
}
