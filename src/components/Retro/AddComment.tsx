'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Plus, SendHorizonal, X } from 'lucide-react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { TextAreaField } from '../Shared/Form/TextAreaField'
import { Card, CardContent } from '../ui/card'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'
import { Form } from '../ui/form'
import { TemplateColumn, useAddRetroCommentMutation } from '@/queries/retro'
import { useRetroContext } from '@/contexts/RetroContext'

interface AddCommentFormType {
    comment: string
}

const validationSchema = zodResolver(
    z.object({
        comment: z.string().min(1),
    }),
)

export default function AddComment({ column }: { column: TemplateColumn }) {
    const { user } = useAuthContext()
    const { retroData } = useRetroContext()
    const [isCommentInputOpen, setIsCommentInputOpen] = useState(false)
    const form = useForm<AddCommentFormType>({
        defaultValues: {
            comment: '',
        },
        resolver: validationSchema,
    })
    const addRetroCommentMutation = useAddRetroCommentMutation()

    const onSubmit = async (data: AddCommentFormType) => {
        if (!user?.id) return

        await addRetroCommentMutation.mutateAsync({
            comment: data.comment,
            column_id: column.id,
            retro_id: retroData.id,
            user_id: user?.id,
        })
        form.reset()
    }

    if (isCommentInputOpen) {
        return (
            <Form {...form}>
                <FormProvider {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        id="add-comment-form"
                    >
                        <Card className="p-0 rounded-md">
                            <CardContent className="pt-2 px-2 flex flex-col">
                                <TextAreaField
                                    variant="ghost"
                                    control={form.control}
                                    name="comment"
                                    placeholder="Add Comment"
                                    hideFormMessage
                                    size="sm"
                                    textAreaProps={{
                                        className:
                                            'resize-none focus-visible:border-0 border-0 focus-visible:ring-0',
                                        onKeyDown: (e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault()
                                                form.handleSubmit(onSubmit)()
                                            }
                                        },
                                    }}
                                />
                                <div className="flex items-center p-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Image
                                            src={
                                                user?.user_metadata
                                                    .profile_picture
                                            }
                                            alt={user?.id ?? ''}
                                            width={28}
                                            height={28}
                                            className="rounded-full"
                                        />
                                        <span className="text-xs text-semibold">
                                            {`${user?.user_metadata.firstName}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center ml-auto gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            type="submit"
                                            className="size-8"
                                            onClick={() => {
                                                setIsCommentInputOpen(false)
                                                form.reset()
                                            }}
                                        >
                                            <X className="size-6" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            type="submit"
                                            className="size-8"
                                            disabled={
                                                form.formState.isSubmitting ||
                                                !form.formState.isValid
                                            }
                                        >
                                            <SendHorizonal className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                </FormProvider>
            </Form>
        )
    }

    return (
        <Button
            variant="outline"
            className="w-full justify-start gap-2"
            size="lg"
            onClick={() => setIsCommentInputOpen(true)}
        >
            <Plus className="size-4" />
            Add Comment
        </Button>
    )
}
