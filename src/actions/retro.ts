import { Database } from '@/lib/supabase/schema'
import { createClient } from '@/lib/supabase/server'
import { TemplateColumn } from '@/queries/retro'

export async function getRetroById(id: string) {
    const supabase = await createClient()
    const { data: user } = await supabase.auth.getSession()
    return await supabase
        .from('retros')
        .select(
            '*, retro_template:retro_templates(*), team:team_id(*), retro_comments:retro_comments(*)',
        )
        .eq('id', id)
        .eq('team_id', user?.session?.user?.user_metadata.team_id)
        .single()
        .overrideTypes<{
            retro_template: Database['public']['Tables']['retro_templates']['Row'] & {
                template_columns: TemplateColumn[]
            }
        }>()
}

export async function getRetrosByTeamId(teamId: string) {
    const supabase = await createClient()
    return await supabase
        .from('retros')
        .select('*, retro_template:retro_templates(id, cover_url, title)')
        .eq('team_id', teamId)
}

export async function deleteRetro(retroId: string) {
    const supabase = await createClient()
    return await supabase.from('retros').delete().eq('id', retroId)
}
