import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const textareaVariants = cva(
    'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content w-full rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-vertical',
    {
        variants: {
            variant: {
                default: '',
                destructive:
                    'border-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
                ghost: 'border-transparent shadow-none bg-transparent',
                outline: 'border-2 shadow-sm',
            },
            size: {
                default: 'min-h-16 px-3 py-2',
                sm: 'min-h-12 px-2.5 py-1.5 text-sm',
                lg: 'min-h-20 px-4 py-3',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

function Textarea({
    className,
    variant,
    size,
    ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
    return (
        <textarea
            data-slot="textarea"
            className={cn(textareaVariants({ variant, size, className }))}
            {...props}
        />
    )
}

export { Textarea, textareaVariants }
