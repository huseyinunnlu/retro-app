import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className="flex flex-col h-screen">
            {/* Header skeleton */}
            <div className="border-b p-4 space-y-3">
                <Skeleton className="h-8 w-64" />
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                </div>
            </div>

            {/* Retro board columns skeleton */}
            <div className="flex-1 p-6 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="size-8 rounded-md" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <Skeleton
                                        key={j}
                                        className="h-24 w-full rounded-lg"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
