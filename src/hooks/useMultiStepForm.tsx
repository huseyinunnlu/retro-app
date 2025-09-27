import React, { useEffect } from 'react'
import {
    FieldValues,
    UseFormReturn,
    Path,
    UseFormProps,
    useForm,
} from 'react-hook-form'

interface UseMultiStepFormProps<FormTypes extends FieldValues> {
    formProps: UseFormProps<FormTypes>
    fieldsByStep: Array<Array<string>>
    initialStep?: number
}

interface UseMultiStepFormReturn<FormTypes extends FieldValues> {
    activeStep: number
    isValid: boolean
    nextStep: () => Promise<void>
    prevStep: () => void
    form: UseFormReturn<FormTypes>
    stepCount: number
}

export default function useMultiStepForm<FormTypes extends FieldValues>({
    formProps,
    fieldsByStep,
    initialStep = 0,
}: UseMultiStepFormProps<FormTypes>): UseMultiStepFormReturn<FormTypes> {
    const [activeStep, setActiveStep] = React.useState<number>(initialStep)
    const [isValid, setIsValid] = React.useState<boolean>(false)
    const form = useForm<FormTypes>({
        ...formProps,
    })

    useEffect(() => {
        if (formProps.mode === 'onChange') {
            form.watch(() => {
                const isValidStep = form.trigger(
                    fieldsByStep[activeStep] as Path<FormTypes>[],
                )
                if (!isValidStep) {
                    setIsValid(false)
                }
            })
        }
    }, [])

    const nextStep = async () => {
        const isValidStep = await form.trigger(
            fieldsByStep[activeStep] as Path<FormTypes>[],
        )
        if (!isValidStep) {
            return
        }
        const nextStep = activeStep + 1
        if (nextStep < fieldsByStep.length) {
            setActiveStep(nextStep)
        }
    }

    const prevStep = () => {
        const prevStep = activeStep - 1
        if (prevStep >= 0) {
            setActiveStep(prevStep)
        }
    }

    return {
        activeStep,
        nextStep,
        prevStep,
        isValid,
        form,
        stepCount: fieldsByStep.length,
    }
}
