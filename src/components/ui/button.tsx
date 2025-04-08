import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    // Layout
    'inline-flex',
    'items-center',
    'justify-center',
    
    // Sizing
    'h-10',
    'rounded-md',
    'text-sm',
    
    // Typography
    'font-medium',
    'whitespace-nowrap',
    
    // Visual
    'transition-colors',
    'ring-offset-background',
    
    // States
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50'
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          'bg-primary',
          'text-primary-foreground',
          'hover:bg-primary/90'
        ].join(' '),
        destructive: [
          'bg-destructive',
          'text-destructive-foreground',
          'hover:bg-destructive/90'
        ].join(' '),
        outline: [
          'border',
          'border-input',
          'bg-background',
          'hover:bg-accent',
          'hover:text-accent-foreground'
        ].join(' '),
        secondary: [
          'bg-secondary',
          'text-secondary-foreground',
          'hover:bg-secondary/80'
        ].join(' '),
        ghost: [
          'hover:bg-accent',
          'hover:text-accent-foreground'
        ].join(' '),
        link: [
          'text-primary',
          'underline-offset-4',
          'hover:underline'
        ].join(' '),
      },
      size: {
        default: [
          'h-10',
          'px-4',
          'py-2'
        ].join(' '),
        sm: [
          'h-9',
          'rounded-md',
          'px-3'
        ].join(' '),
        lg: [
          'h-11',
          'rounded-md',
          'px-8'
        ].join(' '),
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
