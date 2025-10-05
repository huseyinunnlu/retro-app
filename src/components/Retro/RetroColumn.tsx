'use client'
import { TemplateColumn } from '@/queries/retro'
import Image from 'next/image'
import React, { useMemo } from 'react'
import { useRetroContext } from '@/contexts/RetroContext'
import CommentsList from './CommentsList'
import CommentForm from './CommentForm'

interface RetroColumnProps {
    column: TemplateColumn
}

export default function RetroColumn({ column }: RetroColumnProps) {
    const { retroComments } = useRetroContext()
    const comments = useMemo(() => {
        return retroComments.filter(
            (comment) => comment.column_id === column.id,
        )
    }, [column, retroComments])

    return (
        <div className="flex flex-col gap-2 w-1/4">
            <Image
                src={column.imageUrl}
                alt={column.name}
                width={80}
                height={80}
            />
            <h2 className="text-lg font-bold">{column.name}</h2>
            <p className="text-sm text-foreground">{column.description}</p>
            <CommentForm columnId={column.id} />
            <CommentsList comments={comments} columnId={column.id} />
        </div>
    )
}
