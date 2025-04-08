declare module '@/components/ui/button' {
  import { ButtonHTMLAttributes, ReactNode } from 'react'

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    asChild?: boolean
  }

  export const Button: React.ForwardRefExoticComponent<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
  >
  export const buttonVariants: any
}

declare module '@/components/ui/card' {
  import { HTMLAttributes, ReactNode } from 'react'

  export interface CardProps extends HTMLAttributes<HTMLDivElement> {}
  export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}
  export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}
  export interface CardDescriptionProps
    extends HTMLAttributes<HTMLParagraphElement> {}
  export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}
  export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

  export const Card: React.ForwardRefExoticComponent<
    CardProps & React.RefAttributes<HTMLDivElement>
  >
  export const CardHeader: React.ForwardRefExoticComponent<
    CardHeaderProps & React.RefAttributes<HTMLDivElement>
  >
  export const CardTitle: React.ForwardRefExoticComponent<
    CardTitleProps & React.RefAttributes<HTMLHeadingElement>
  >
  export const CardDescription: React.ForwardRefExoticComponent<
    CardDescriptionProps & React.RefAttributes<HTMLParagraphElement>
  >
  export const CardContent: React.ForwardRefExoticComponent<
    CardContentProps & React.RefAttributes<HTMLDivElement>
  >
  export const CardFooter: React.ForwardRefExoticComponent<
    CardFooterProps & React.RefAttributes<HTMLDivElement>
  >
}
