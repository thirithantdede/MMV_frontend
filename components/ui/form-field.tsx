"use client"

import { memo, type ReactNode } from "react"
import { Label } from "@/components/ui/label"

interface FormFieldProps {
  id: string
  label: string
  children: ReactNode
  description?: string
  className?: string
}

export const FormField = memo(function FormField({ id, label, children, description, className = "" }: FormFieldProps) {
  return (
    <div className={`grid gap-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  )
})
