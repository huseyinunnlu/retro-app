'use client'
import { useGetRetroTemplateById } from '@/queries/retro'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import Spinner from '../Shared/Spinner'
import Image from 'next/image'
import { TextInputField } from '../Shared/Form/TextInputField'
import { Button } from '../ui/button'

export default function EnterNewRetroDetailsStep() {
    const form = useFormContext()
    const { data: templateData, isPending } = useGetRetroTemplateById(
        form.getValues('template_id'),
    )

    if (isPending)
        return (
            <div className="w-full h-48 flex items-center justify-center">
                <Spinner />
            </div>
        )

    return (
        <div className="container-xl flex flex-col gap-6 mt-6">
            <Image
                src={templateData?.cover_url || ''}
                alt={templateData?.title || ''}
                width={576}
                height={208}
                className="rounded-lg w-full h-52 object-cover object-center"
            />
            <h2 className="text-xl font-bold">{templateData?.title}</h2>
            <TextInputField
                control={form.control}
                name="name"
                label="Retro Name"
                placeholder="Enter Retro Name"
            />
            <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-auto inline-block"
            >
                {form.formState.isSubmitting
                    ? 'Creating Retro...'
                    : 'Create Retro '}
            </Button>
        </div>
    )
}
