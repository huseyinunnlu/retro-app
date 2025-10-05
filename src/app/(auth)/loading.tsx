'use client'
import React from 'react'
import Spinner from '@/components/Shared/Spinner'

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-screen w-full">
            <div className="flex flex-col items-center gap-4">
                <Spinner className="size-12" />
                <p className="text-sm text-muted-foreground animate-pulse">
                    Authenticating...
                </p>
            </div>
        </div>
    )
}
