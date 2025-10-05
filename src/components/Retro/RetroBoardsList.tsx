'use client'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import React from 'react'
import { Database } from '@/lib/supabase/schema'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '../ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { useDeleteRetroMutation } from '@/queries/retro'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RetroBoardsListProps {
    retros: (Database['public']['Tables']['retros']['Row'] & {
        retro_template: Pick<
            Database['public']['Tables']['retro_templates']['Row'],
            'id' | 'cover_url' | 'title'
        >
    })[]
}

export default function RetroBoardsList({ retros }: RetroBoardsListProps) {
    const { user } = useAuthContext()
    const router = useRouter()
    const deleteRetroMutation = useDeleteRetroMutation()
    const handleDeleteRetro = (retroId: string) => {
        deleteRetroMutation.mutate(retroId)
        router.refresh()
    }

    return (
        <div className="grid grid-cols-3 gap-6">
            {retros && retros?.length > 0 ? (
                retros.map((retro) => (
                    <Link href={`/retro/${retro?.id}`} key={retro?.id}>
                        <Card
                            key={retro.id}
                            className="p-0 h-72 col-span-1 transition-all duration-300 cursor-pointer hover:scale-105 group relative"
                        >
                            <CardContent className="flex flex-col w-full h-full p-0 m-0">
                                <div className="flex items-center gap-4 bg-foreground/80 text-white rounded-t-lg p-4">
                                    <Image
                                        src={
                                            retro.retro_template.cover_url || ''
                                        }
                                        alt={retro.retro_template.title}
                                        width={64}
                                        height={64}
                                        className="rounded-full"
                                    />
                                    <div className="flex flex-col">
                                        <h3 className="text-md font-bold flex items-center gap-2">
                                            {retro.retro_template.title}
                                        </h3>
                                        <p className="text-sm">
                                            {Intl.DateTimeFormat('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            }).format(
                                                new Date(retro.created_at),
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col p-4">
                                    <h4 className="text-md font-bold">
                                        {retro.name}
                                    </h4>
                                </div>
                                {user?.user_metadata.role === 'admin' && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="group-hover:flex hidden absolute top-2 right-2"
                                        disabled={deleteRetroMutation.isPending}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleDeleteRetro(retro.id)
                                        }}
                                    >
                                        {deleteRetroMutation.isPending ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="size-4" />
                                        )}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Link>
                ))
            ) : (
                <p className="text-gray-500">No retro boards found</p>
            )}
        </div>
    )
}
