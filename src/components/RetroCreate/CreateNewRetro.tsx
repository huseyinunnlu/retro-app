'use client'
import React, { useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Plus } from 'lucide-react'
import CreateNewRetroDialog from './CreateNewRetroDialog'

export default function CreateNewRetro() {
    const [retroCreateDialogOpen, setRetroCreateDialogOpen] = useState(false)
    return (
        <>
            <Card
                className="bg-primary text-white h-52 col-span-1 hover:bg-primary/90 transition-all duration-300 cursor-pointer hover:scale-105"
                onClick={() => setRetroCreateDialogOpen(true)}
            >
                <CardContent className="flex flex-col w-full h-full justify-center items-center">
                    <Plus className="size-8 my-auto -mb-2" />
                    <p className="font-semibold mt-auto">Start new retro</p>
                </CardContent>
            </Card>
            <CreateNewRetroDialog
                retroCreateDialogOpen={retroCreateDialogOpen}
                setRetroCreateDialogOpen={setRetroCreateDialogOpen}
            />
        </>
    )
}
