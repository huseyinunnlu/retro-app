'use client'
import { Menu } from 'lucide-react'
import { Button } from '../ui/button'
import React, { Dispatch, SetStateAction } from 'react'

interface HeaderProps {
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>
}

export default function RetroPageHeader({ setIsSidebarOpen }: HeaderProps) {
    return (
        <div className="flex items-center gap-4 p-4 h-16">
            <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="size-5.5" strokeWidth={3} />
            </Button>
        </div>
    )
}
