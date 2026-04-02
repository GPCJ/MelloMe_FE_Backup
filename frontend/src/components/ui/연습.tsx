import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva {
    "디폴트 클래스들",
    {
        variants: {
            variant: {
                default: 'bg-primary ...',
                outline: 'border-border ...',
                secondary: 'bg-secondary ...',
                ghost: 'hober:bg-muted ...',
                destructive: 'bg-destructive/10 ...',
                link: 'text-primary ...',
            },
            size: {
                default: 'h-8 ...',
                xs: 'h-6 ...',
                sm: 'h-7 ...',
                lg: 'h-9 ...',
                icon: 'size-8 ...',
                'icon-xs':
                'size-6 ...',
                'icon-sm':'size-7 ...',
                'icon-lg': 'size-9',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
}

function Button({
    className,
    variant = 'default',
    size = 'default',
    ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>){
    return (
        <ButtonPrimitive
        data-slot='button'
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
        />
        )
    }
}