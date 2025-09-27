'use client'

import useMultiStepForm from '@/hooks/useMultiStepForm'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form } from '../ui/form'
import { FormProvider } from 'react-hook-form'
import SelectRetroTemplateStep from './SelectRetroTemplateStep'
import EnterNewRetroDetailsStep from './EnterNewRetroDetailsStep'
import { CreateNewRetroFormType, useCreateRetro } from '@/queries/retro'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const validationSchema = zodResolver(
    z.object({
        template_id: z.uuid(),
        name: z.string().min(1).max(255),
    }),
)

export default function CreateNewRetroForm() {
    const createRetroMutation = useCreateRetro()
    const { team } = useAuthContext()
    const router = useRouter()
    const { form, activeStep, nextStep } =
        useMultiStepForm<CreateNewRetroFormType>({
            formProps: {
                mode: 'onTouched',
                shouldUnregister: false,
                defaultValues: {
                    template_id: '',
                    name: '',
                },
                resolver: validationSchema,
            },
            fieldsByStep: [['template_id'], ['name']],
        })

    const renderForm = () => {
        switch (activeStep) {
            case 0:
                return <SelectRetroTemplateStep />
            case 1:
                return <EnterNewRetroDetailsStep />
        }
        return <SelectRetroTemplateStep />
    }

    const templateId = form.watch('template_id')
    if (templateId) {
        form.trigger('template_id')
        nextStep()
    }

    const onSubmit = async (data: CreateNewRetroFormType) => {
        const result = await createRetroMutation.mutateAsync({
            ...data,
            team_id: team?.id,
        })

        router.push(`/retro/${result.id}`)
    }

    return (
        <Form {...form}>
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    id="create-retro-form"
                >
                    {renderForm()}
                </form>
            </FormProvider>
        </Form>
    )
}
