'use client'
import { Database } from '@/lib/supabase/schema'
import React, { Ref } from 'react'
import { Card, CardContent } from '../ui/card'
import Image from 'next/image'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { useDeleteRetroCommentMutation } from '@/queries/retro'
import { useDrag, useDrop } from 'react-dnd'
import { DndItemTypes } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useRetroContext } from '@/contexts/RetroContext'

interface CommentsListProps {
    comments: Database['public']['Tables']['retro_comments']['Row'][]
    columnId: string
}

interface CommentItemProps {
    comment: Database['public']['Tables']['retro_comments']['Row']
}

function CommentItem({ comment }: CommentItemProps) {
    const { user } = useAuthContext()
    const deleteRetroCommentMutation = useDeleteRetroCommentMutation()

    const [{ isDragging }, drag] = useDrag(() => ({
        type: DndItemTypes.RETRO_COMMENT_CARD,
        item: {
            commentId: comment.id,
            currentColumnId: comment.column_id,
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))
    return (
        <Card
            className={cn(
                'p-0 rounded-md cursor-pointer',
                isDragging && 'opacity-50',
            )}
            key={comment.id}
            ref={drag as unknown as Ref<HTMLDivElement>}
        >
            <CardContent className="p-2 flex flex-col">
                <div className="flex flex-col gap-2 text-sm">
                    <p>{comment.comment}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Image
                                src={
                                    comment.user_id === user?.id
                                        ? user?.user_metadata.profile_picture
                                        : '/team-avatars/heartEmoji.png'
                                }
                                alt={comment.user_id}
                                width={24}
                                height={24}
                                className="rounded-full"
                            />
                            <span className="text-xs text-semibold">
                                {`${comment.user_id === user?.id ? user?.user_metadata.firstName : 'Anonymous'}`}
                            </span>
                        </div>
                        {(comment.user_id === user?.id ||
                            user?.user_metadata.role === 'admin') && (
                            <Button
                                disabled={deleteRetroCommentMutation.isPending}
                                variant="ghost"
                                size="sm"
                                className="size-6 ml-auto"
                                onClick={() => {
                                    deleteRetroCommentMutation.mutate(
                                        comment.id,
                                    )
                                }}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function CommentsList({
    comments,
    columnId,
}: CommentsListProps) {
    const { changeCommentColumn } = useRetroContext()
    const [{ canDrop, isOver }, drop] = useDrop(
        () => ({
            accept: DndItemTypes.RETRO_COMMENT_CARD,
            drop: (data: { commentId: string; currentColumnId: string }) => {
                if (data.currentColumnId === columnId) return
                changeCommentColumn(data.commentId, columnId)
            },
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
                canDrop: monitor.canDrop(),
            }),
        }),
        [comments, columnId],
    )

    return (
        <div
            className={cn(
                'flex flex-col gap-2 h-[calc(100vh-20rem)] overflow-y-auto relative',
                canDrop &&
                    isOver &&
                    'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg',
                canDrop &&
                    !isOver &&
                    'border-2 border-dashed border-gray-200 rounded-lg',
            )}
            ref={drop as unknown as Ref<HTMLDivElement>}
        >
            {comments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
            ))}

            {/* Drop Zone Visual Feedback */}
            {canDrop && (
                <div
                    className={cn(
                        'absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-200',
                        isOver ? 'opacity-100' : 'opacity-0',
                    )}
                ></div>
            )}
        </div>
    )
}
