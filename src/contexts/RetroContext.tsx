'use client'
import supabase from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/schema'
import { TemplateColumn, useChangeColumnIdMutation } from '@/queries/retro'
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react'

type RetroData = Database['public']['Tables']['retros']['Row'] & {
    retro_template: Database['public']['Tables']['retro_templates']['Row'] & {
        template_columns: TemplateColumn[]
    }
    team: Database['public']['Tables']['teams']['Row']
    retro_comments: Database['public']['Tables']['retro_comments']['Row'][]
}

interface RetroContextProviderProps {
    children: ReactNode
    retroData: RetroData
}

interface RetroContextType {
    retroData: RetroData
    retroComments: Database['public']['Tables']['retro_comments']['Row'][]
    changeCommentColumn: (commentId: string, newColumnId: string) => void
}

const RetroContext = createContext({})

export default function RetroContextProvider({
    children,
    retroData,
}: RetroContextProviderProps) {
    const [retroComments, setRetroComments] = useState<
        Database['public']['Tables']['retro_comments']['Row'][]
    >(retroData.retro_comments || [])
    const [lastUpdatedCommentId, setLastUpdatedCommentId] = useState<
        string | null
    >(null)
    const changeColumnIdMutation = useChangeColumnIdMutation()
    useEffect(() => {
        if (!retroData.id) return
        const channel = supabase
            .channel(`schema-db-changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'retro_comments',
                    filter: `retro_id=eq.${retroData.id}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setRetroComments([
                            ...retroComments,
                            payload.new as Database['public']['Tables']['retro_comments']['Row'],
                        ])
                    }
                    if (payload.eventType === 'UPDATE') {
                        if (payload.new?.id === lastUpdatedCommentId) {
                            setLastUpdatedCommentId(null)
                            return
                        }
                        setRetroComments(
                            retroComments.map((comment) =>
                                comment.id === payload.new?.id
                                    ? (payload.new as Database['public']['Tables']['retro_comments']['Row'])
                                    : comment,
                            ),
                        )
                    }
                    if (payload.eventType === 'DELETE') {
                        setRetroComments(
                            retroComments.filter(
                                (comment) => comment.id !== payload.old?.id,
                            ),
                        )
                    }
                    console.log('event', payload)
                },
            )
            .subscribe()
        return () => {
            channel.unsubscribe()
        }
    })

    function changeCommentColumn(commentId: string, newColumnId: string) {
        setLastUpdatedCommentId(commentId)
        changeColumnIdMutation.mutate({
            commentId,
            newColumnId,
        })
        setRetroComments(
            retroComments.map((comment) =>
                comment.id === commentId
                    ? { ...comment, column_id: newColumnId }
                    : comment,
            ),
        )
    }

    return (
        <RetroContext.Provider
            value={{ retroData, retroComments, changeCommentColumn }}
        >
            {children}
        </RetroContext.Provider>
    )
}

export const useRetroContext = () =>
    useContext(RetroContext) as RetroContextType
