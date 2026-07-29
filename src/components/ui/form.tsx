"use client"

import * as React from "react"
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"

const Form = FormProvider

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <Controller
      {...props}
    />
  )
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  />
))

FormItem.displayName = "FormItem"


const FormLabel = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return (
    <label className="text-sm font-medium">
      {children}
    </label>
  )
}


const FormControl = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return <>{children}</>
}


const FormMessage = () => {
  const { formState } = useFormContext()

  return (
    <p className="text-sm text-red-500">
      {Object.values(formState.errors)[0]?.message as string}
    </p>
  )
}


export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
}
