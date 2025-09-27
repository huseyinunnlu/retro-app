import { getRetroById } from '@/actions/retro'
import RetroNotFound from './not-found'
import RetroContextProvider from '@/contexts/RetroContext'
import RetroPage from '@/components/Retro/RetroPage'

interface PageProps {
    params: {
        id: string
    }
}

export default async function Page({ params }: PageProps) {
    const { id } = await params
    const { data: retroData, error } = await getRetroById(id)

    if (error || !retroData) {
        return <RetroNotFound />
    }

    return (
        <RetroContextProvider retroData={retroData}>
            <RetroPage />
        </RetroContextProvider>
    )
}
