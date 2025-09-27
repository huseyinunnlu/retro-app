'use client'
import { useRetroContext } from '@/contexts/RetroContext'
import React, { useState } from 'react'
import Header from './RetroPageHeader'
import RetroPageSidebar from './RetroPageSidebar'
import RetroColumn from './RetroColumn'
import { TemplateColumn } from '@/queries/retro'

export default function RetroPage() {
    const { retroData } = useRetroContext()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div
            className="h-screen w-screen overflow-auto flex flex-col"
            style={{
                backgroundColor:
                    retroData.retro_template.background_color || '#fff',
            }}
        >
            <Header setIsSidebarOpen={setIsSidebarOpen} />
            <div className="container mx-auto w-full h-full flex justify-around mt-8">
                {retroData.retro_template.template_columns.map(
                    (column: TemplateColumn) => (
                        <RetroColumn key={column.id} column={column} />
                    ),
                )}
            </div>
            <RetroPageSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />
        </div>
    )
}
