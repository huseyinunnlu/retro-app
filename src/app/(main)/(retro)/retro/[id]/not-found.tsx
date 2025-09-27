import Link from 'next/link'
import React from 'react'

export default function RetroNotFound() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold">Retro not found</h1>
            <Link href="/">Go to home page</Link>
        </div>
    )
}
