import { getRetrosByTeamId } from '@/actions/retro'
import CreateNewRetro from '@/components/RetroCreate/CreateNewRetro'
import RetroBoardsList from '@/components/Retro/RetroBoardsList'
import { createClient } from '@/lib/supabase/server'
import React from 'react'

export default async function Home() {
    const supabase = await createClient()
    const { data } = await supabase.auth.getSession()
    const { data: retros } = await getRetrosByTeamId(
        data.session?.user?.user_metadata.team_id,
    )

    return (
        <div className="flex flex-col gap-4 w-full h-full container-6xl">
            <h1 className="text-2xl font-bold">
                Welcome {data.session?.user?.user_metadata.firstName}
            </h1>
            <div className="grid grid-cols-5 gap-4">
                {data.session?.user?.user_metadata?.role === 'admin' ? (
                    <CreateNewRetro />
                ) : null}
            </div>
            <h1 className="text-lg font-bold mt-8">Retro Boards</h1>
            <RetroBoardsList retros={retros || []} />
        </div>
    )
}
