'use client'

import React from 'react'
import { Control, FieldPath, FieldValues } from 'react-hook-form'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Textarea, textareaVariants } from '@/components/ui/textarea'
import { type VariantProps } from 'class-variance-authority'

interface TextAreaFieldProps<T extends FieldValues> {
    control: Control<T>
    name: FieldPath<T>
    label?: string
    placeholder?: string
    className?: string
    rows?: number
    variant?: VariantProps<typeof textareaVariants>['variant']
    size?: VariantProps<typeof textareaVariants>['size']
    textAreaProps?: React.ComponentProps<typeof Textarea>
    hideFormMessage?: boolean
}

export function TextAreaField<T extends FieldValues>({
    control,
    name,
    label = undefined,
    placeholder,
    className,
    rows = 3,
    variant = 'default',
    size = 'default',
    textAreaProps,
    hideFormMessage = false,
}: TextAreaFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label ? <FormLabel>{label}</FormLabel> : null}
                    <FormControl>
                        <Textarea
                            placeholder={placeholder}
                            rows={rows}
                            variant={variant}
                            size={size}
                            {...field}
                            {...textAreaProps}
                        />
                    </FormControl>
                    {!hideFormMessage ? <FormMessage /> : null}
                </FormItem>
            )}
        />
    )
}
