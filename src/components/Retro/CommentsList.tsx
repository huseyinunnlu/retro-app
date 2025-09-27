'use client'
import { Database } from '@/lib/supabase/schema'
import React from 'react'
import { Card, CardContent } from '../ui/card'
import { useAuthContext } from '@/contexts/AuthContext'
import Image from 'next/image'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { useDeleteRetroCommentMutation } from '@/queries/retro'

interface CommentsListProps {
    comments: Database['public']['Tables']['retro_comments']['Row'][]
}

export default function CommentsList({ comments }: CommentsListProps) {
    const { user } = useAuthContext()
    const deleteRetroCommentMutation = useDeleteRetroCommentMutation()
    return (
        <div className="flex flex-col gap-2">
            {comments.map((comment) => (
                <Card className="p-0 rounded-md" key={comment.id}>
                    <CardContent className="p-2 flex flex-col">
                        <div className="flex flex-col gap-2 text-sm">
                            <p>{comment.comment}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Image
                                        src={
                                            comment.user_id === user?.id
                                                ? user?.user_metadata
                                                      .profile_picture
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
                                        disabled={
                                            deleteRetroCommentMutation.isPending
                                        }
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
            ))}
        </div>
    )
}
