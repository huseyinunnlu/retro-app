'use client'
import React, { Dispatch, SetStateAction } from 'react'
import { Dialog, DialogContent } from '../ui/dialog'
import CreateNewRetroForm from './CreateNewRetroForm'
import { DialogTitle } from '@radix-ui/react-dialog'

interface CreateNewRetroDialogProps {
    retroCreateDialogOpen: boolean
    setRetroCreateDialogOpen: Dispatch<SetStateAction<boolean>>
}

export default function CreateNewRetroDialog({
    retroCreateDialogOpen,
    setRetroCreateDialogOpen,
}: CreateNewRetroDialogProps) {
    return (
        <Dialog
            open={retroCreateDialogOpen}
            onOpenChange={setRetroCreateDialogOpen}
        >
            <DialogContent className="!w-screen !max-w-screen rounded-none h-screen">
                <DialogTitle className="hidden">Create new retro</DialogTitle>
                <CreateNewRetroForm />
            </DialogContent>
        </Dialog>
    )
}
