import supabase from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/schema'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface RetroTemplateFiter {
    search: string
    //category: string
}

export interface TemplateColumn {
    id: string
    name: string
    description: string
    imageUrl: string
}

export interface CreateNewRetroFormType {
    template_id: string
    name: string
}

export interface AddRetroComment {
    comment: string
    column_id: string
    retro_id: string
    user_id: string
}

export interface ChangeColumnId {
    commentId: string
    newColumnId: string
}

export const useGetRetroTemplates = (filter: RetroTemplateFiter) => {
    return useQuery({
        queryKey: ['retro-templates', filter],
        queryFn: async () => {
            console.log(filter)
            const { data, error } = await supabase
                .from('retro_templates')
                .select('*')
                .ilike('title', `%${filter.search}%`)
            if (error) throw error
            return data
        },
    })
}

export const useGetRetroTemplateById = (id: string) => {
    return useQuery({
        queryKey: ['retro-template', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('retro_templates')
                .select('*')
                .eq('id', id)
                .single()
            if (error) throw error
            return data as Database['public']['Tables']['retro_templates']['Row'] & {
                template_columns: TemplateColumn[]
            }
        },
    })
}

export const useCreateRetro = () => {
    return useMutation({
        mutationKey: ['create-retro'],
        onError: (error) => {
            console.log('error', error)
            toast.error('Failed to create retro')
        },
        onSuccess: () => {
            toast.success('Retro created successfully')
        },
        mutationFn: async (
            retroFormData: CreateNewRetroFormType & { team_id: string },
        ) => {
            const { data, error } = await supabase
                .from('retros')
                .insert(retroFormData)
                .select()
                .single()
            if (error) throw error
            return data
        },
    })
}

export const useAddRetroCommentMutation = () => {
    return useMutation({
        mutationKey: ['add-retro-comment'],
        mutationFn: async (commentFormData: AddRetroComment) => {
            await supabase.auth.getUser()
            const { data, error } = await supabase
                .from('retro_comments')
                .insert(commentFormData)

            if (error) throw error
            return data
        },
    })
}

export const useDeleteRetroCommentMutation = () => {
    return useMutation({
        mutationKey: ['delete-retro-comment'],
        mutationFn: async (commentId: string) => {
            const { data, error } = await supabase
                .from('retro_comments')
                .delete()
                .eq('id', commentId)
            if (error) throw error
            return data
        },
        onError: () => {
            toast.error('Failed to delete retro comment')
        },
        onSuccess: () => {
            toast.success('Retro comment deleted successfully')
        },
    })
}

export const useDeleteRetroMutation = () => {
    return useMutation({
        mutationKey: ['delete-retro'],
        mutationFn: async (retroId: string) => {
            const { data, error } = await supabase
                .from('retros')
                .delete()
                .eq('id', retroId)
            if (error) throw error
            return data
        },
    })
}

export const useChangeColumnIdMutation = () => {
    return useMutation({
        mutationKey: ['change-column-id'],
        mutationFn: async (mutationData: ChangeColumnId) => {
            console.log(mutationData)
            const { data, error } = await supabase
                .from('retro_comments')
                .update({ column_id: mutationData.newColumnId })
                .eq('id', mutationData.commentId)
                .select()
            if (error) throw error
            return data
        },
    })
}

export const useUpdateRetroCommentMutation = () => {
    return useMutation({
        mutationKey: ['update-retro-comment'],
        mutationFn: async (commentFormData: {
            id: string
            comment: string
        }) => {
            const { data, error } = await supabase
                .from('retro_comments')
                .update({
                    comment: commentFormData.comment,
                })
                .eq('id', commentFormData.id)
                .select()
                .single()
            if (error) throw error
            return data
        },
        onError: () => {
            toast.error('Failed to update retro comment')
        },
        onSuccess: () => {
            toast.success('Retro comment updated successfully')
        },
    })
}
