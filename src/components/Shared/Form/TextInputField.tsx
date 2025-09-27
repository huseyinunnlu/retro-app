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
import { Input } from '@/components/ui/input'

interface TextInputFieldProps<T extends FieldValues> {
    control: Control<T>
    name: FieldPath<T>
    label: string
    placeholder?: string
    type?: string
    className?: string
    //inputSize?: InputProps['inputSize'];
    //variant?: InputProps['variant'];
}

export function TextInputField<T extends FieldValues>({
    control,
    name,
    label,
    placeholder,
    type = 'text',
    className,
    //inputSize = 'default',
    //variant = 'default',
}: TextInputFieldProps<T>) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            type={type}
                            placeholder={placeholder}
                            {...field}
                            //inputSize={inputSize}
                            //variant={variant}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
