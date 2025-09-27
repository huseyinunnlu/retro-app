'use client'
import { TemplateColumn } from '@/queries/retro'
import Image from 'next/image'
import React, { useMemo } from 'react'
import AddComment from './AddComment'
import { useRetroContext } from '@/contexts/RetroContext'
import CommentsList from './CommentsList'

interface RetroColumnProps {
    column: TemplateColumn
}

export default function RetroColumn({ column }: RetroColumnProps) {
    const { retroComments } = useRetroContext()
    console.log(retroComments)
    const comments = useMemo(() => {
        return retroComments.filter(
            (comment) => comment.column_id === column.id,
        )
    }, [column, retroComments])
    console.log(comments)
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
            <AddComment column={column} />
            {comments.length > 0 && <CommentsList comments={comments} />}
        </div>
    )
}
