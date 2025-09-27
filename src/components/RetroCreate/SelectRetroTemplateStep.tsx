'use client'
import React, { Dispatch, SetStateAction, useState } from 'react'
import {
    SidebarContent,
    SidebarProvider,
    SidebarRail,
    SidebarInset,
    SidebarTrigger,
    Sidebar,
} from '../ui/sidebar'
import { Input } from '../ui/input'
import {
    RetroTemplateFiter,
    TemplateColumn,
    useGetRetroTemplates,
} from '@/queries/retro'
import { Card } from '../ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import Image from 'next/image'
import { useFormContext } from 'react-hook-form'
import Spinner from '../Shared/Spinner'
import { Database } from '@/lib/supabase/schema'
import { Button } from '../ui/button'

function TemplateDetailsDialog({
    templateDetailsDialogOpen,
    setTemplateDetailsDialogOpen,
    activeTemplateData,
}: {
    templateDetailsDialogOpen: boolean
    setTemplateDetailsDialogOpen: Dispatch<SetStateAction<boolean>>
    activeTemplateData:
        | (Database['public']['Tables']['retro_templates']['Row'] & {
              template_columns: TemplateColumn[]
          })
        | null
}) {
    const form = useFormContext()
    if (!activeTemplateData || !activeTemplateData.template_columns) return null
    return (
        <Dialog
            open={templateDetailsDialogOpen}
            onOpenChange={setTemplateDetailsDialogOpen}
        >
            <DialogContent
                className="!max-w-2xl !w-full"
                showCloseButton={false}
            >
                <DialogTitle className="hidden">
                    {activeTemplateData.title}
                </DialogTitle>
                <DialogHeader
                    className="w-full h-52 rounded-lg"
                    style={{
                        backgroundImage: `url(${activeTemplateData.cover_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                ></DialogHeader>
                <div className="flex flex-col gap-6 mt-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            {activeTemplateData.title}
                        </h2>
                        <Button
                            onClick={() => {
                                form.setValue(
                                    'template_id',
                                    activeTemplateData.id,
                                )
                                setTemplateDetailsDialogOpen(false)
                                form.trigger('template_id')
                            }}
                        >
                            Use template
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {activeTemplateData.template_columns.map(
                            (column: TemplateColumn) => (
                                <div
                                    className="flex items-center gap-4 col-span-1"
                                    key={column.id}
                                >
                                    <Image
                                        src={column.imageUrl}
                                        alt={column.id}
                                        width={80}
                                        height={80}
                                    />
                                    <div className="flex flex-col">
                                        <h2 className="text-lg font-bold">
                                            {column.name}
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            {column.description}
                                        </p>
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                    <p
                        className="text-sm text-muted-foreground bg-primary/10 p-4 rounded-lg"
                        dangerouslySetInnerHTML={{
                            __html: activeTemplateData.description || '',
                        }}
                    ></p>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function SelectRetroTemplateStep() {
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(
        null,
    )
    const [templateDetailsDialogOpen, setTemplateDetailsDialogOpen] =
        useState<boolean>(false)
    const [filter, setFilter] = useState<RetroTemplateFiter>({
        search: '',
        //category: '',
    })

    const { data: retroTemplates, isPending } = useGetRetroTemplates(filter)

    return (
        <SidebarProvider>
            <Sidebar collapsible="icon">
                <SidebarContent>sidebar</SidebarContent>
                <SidebarRail />
            </Sidebar>
            <SidebarInset className="flex flex-col">
                <div className="flex items-center h-8 -mt-2.5">
                    <SidebarTrigger
                        className="size-8"
                        iconProps={{ className: 'size-5' }}
                    />
                </div>
                <div className="container-3xl flex flex-col gap-4">
                    <h1 className="text-2xl font-bold text-center mt-6">
                        Select Retro Template
                    </h1>
                    <div className="flex items-center gap-4-">
                        <Input
                            placeholder="Search"
                            value={filter.search}
                            onChange={(e) =>
                                setFilter({ ...filter, search: e.target.value })
                            }
                            className="w-full max-w-sm"
                        />
                    </div>
                    {isPending ? (
                        <div className="w-full h-48 flex items-center justify-center">
                            <Spinner />
                        </div>
                    ) : (
                        retroTemplates?.map((template) => (
                            <div
                                className="grid grid-cols-4 gap-4"
                                key={template.id}
                            >
                                <div
                                    className="flex flex-col gap-4 cursor-pointer group"
                                    key={template.id}
                                    onClick={() => {
                                        setActiveTemplateId(template.id)
                                        setTemplateDetailsDialogOpen(true)
                                    }}
                                >
                                    <Card
                                        className="col-span-1 bg-cover bg-center h-52 group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300"
                                        style={{
                                            backgroundImage: `url(${template.cover_url})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    ></Card>
                                    <h3 className="text-lg font-bold">
                                        {template.title}
                                    </h3>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SidebarInset>
            <TemplateDetailsDialog
                templateDetailsDialogOpen={templateDetailsDialogOpen}
                setTemplateDetailsDialogOpen={setTemplateDetailsDialogOpen}
                activeTemplateData={
                    activeTemplateId
                        ? (retroTemplates?.find(
                              (template) => template.id === activeTemplateId,
                          ) as
                              | (Database['public']['Tables']['retro_templates']['Row'] & {
                                    template_columns: TemplateColumn[]
                                })
                              | null)
                        : null
                }
            />
        </SidebarProvider>
    )
}
