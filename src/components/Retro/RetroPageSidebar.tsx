'use client'
import React, { Dispatch, SetStateAction } from 'react'
import { SheetContent, SheetHeader, SheetTitle, Sheet } from '../ui/sheet'
import { useRetroContext } from '@/contexts/RetroContext'
import { Button } from '../ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface RetroPageSidebarProps {
    isSidebarOpen: boolean
    setIsSidebarOpen: Dispatch<SetStateAction<boolean>>
}

export default function RetroPageSidebar({
    isSidebarOpen,
    setIsSidebarOpen,
}: RetroPageSidebarProps) {
    const { team } = useAuthContext()
    const { retroData } = useRetroContext()

    function handleCopyInviteToken() {
        if (team.invite_token) {
            navigator.clipboard.writeText(
                `${window.location.origin}/register?token=${team.invite_token}&redirectTo=/retro/${retroData.id}`,
            )
            toast.success('Invite link copied to clipboard')
        }
    }
    return (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent className="w-[400px] sm:w-[540px]" side="left">
                <SheetHeader>
                    <SheetTitle className="hidden">
                        Are you absolutely sure?
                    </SheetTitle>
                    <div className="flex items-center gap-2">
                        <Image
                            src="/team-avatars/heartEmoji.png"
                            alt="Retro"
                            width={40}
                            height={40}
                        />

                        <h4 className="font-semibold text-foreground">
                            {retroData.team.name}
                        </h4>
                    </div>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4">
                    <h4 className="font-semibold text-foreground">
                        {retroData.name}
                    </h4>
                    <Button onClick={handleCopyInviteToken}>
                        Copy Invite Link
                    </Button>
                    <Link href="/">
                        <Button>Leave Retro</Button>
                    </Link>
                </div>
            </SheetContent>
        </Sheet>
    )
}
