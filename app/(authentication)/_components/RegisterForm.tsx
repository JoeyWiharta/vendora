"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { registerSchema } from "../_schemas/registerSchema";
import { useRegister } from "../_hooks/useRegister";
import type { RegisterFormValues } from "../_types/registerTypes";
import { ROLE_OPTIONS } from "../_constants/RoleOptions";

const RegisterForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { mutate: doRegister, isPending } = useRegister();

    const { register, control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: "customer",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = handleSubmit((values) => {
        doRegister({
            email: values.email,
            password: values.password,
            role: values.role,
        });
    });

    return (
        <form onSubmit={onSubmit} noValidate className="w-full min-w-0">
            <FieldSet className="flex min-w-0 flex-col gap-6">
                <FieldGroup className="flex min-w-0 flex-col gap-4">
                    <Field data-invalid={!!errors.role}>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={isPending}
                                    className="grid grid-cols-2 gap-3"
                                >
                                    {ROLE_OPTIONS.map((option) => (
                                        <FieldLabel
                                            key={option.value}
                                            htmlFor={`role-${option.value}`}
                                        >
                                            <Field orientation="horizontal">
                                                <FieldContent>
                                                    <FieldTitle>{option.title}</FieldTitle>
                                                    <FieldDescription>
                                                        {option.description}
                                                    </FieldDescription>
                                                </FieldContent>
                                                <RadioGroupItem
                                                    value={option.value}
                                                    id={`role-${option.value}`}
                                                />
                                            </Field>
                                        </FieldLabel>
                                    ))}
                                </RadioGroup>
                            )}
                        />
                        {errors.role && <FieldError>{errors.role.message}</FieldError>}
                    </Field>

                    <Field data-invalid={!!errors.email}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <InputGroup className="px-2">
                            <InputGroupAddon>
                                <Mail />
                            </InputGroupAddon>
                            <InputGroupInput
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Email address"
                                disabled={isPending}
                                aria-invalid={!!errors.email}
                                {...register("email")}
                            />
                        </InputGroup>
                        {errors.email && <FieldError>{errors.email.message}</FieldError>}
                    </Field>

                    <Field data-invalid={!!errors.password}>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <InputGroup className="px-2">
                            <InputGroupAddon>
                                <Lock />
                            </InputGroupAddon>
                            <InputGroupInput
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Password"
                                disabled={isPending}
                                aria-invalid={!!errors.password}
                                {...register("password")}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    type="button"
                                    size="icon-xs"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        {errors.password && <FieldError>{errors.password.message}</FieldError>}
                    </Field>

                    <Field data-invalid={!!errors.confirmPassword}>
                        <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                        <InputGroup className="px-2">
                            <InputGroupAddon>
                                <Lock />
                            </InputGroupAddon>
                            <InputGroupInput
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                disabled={isPending}
                                aria-invalid={!!errors.confirmPassword}
                                {...register("confirmPassword")}
                            />
                            <InputGroupAddon align="inline-end">
                                <InputGroupButton
                                    type="button"
                                    size="icon-xs"
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                >
                                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        {errors.confirmPassword && <FieldError>{errors.confirmPassword.message}</FieldError>}
                    </Field>
                </FieldGroup>

                <Field className="gap-4">
                    <Button type="submit" size="lg" disabled={isPending}>
                        {isPending && <Spinner />}
                        {isPending ? "Loading..." : "Sign up"}
                    </Button>

                    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                        Or
                    </FieldSeparator>

                    <FieldDescription className="text-center">
                        Already have an account?
                        <Link href="/login" className="ml-1 font-medium text-primary">
                            Login
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldSet>
        </form>
    );
}

export default RegisterForm;