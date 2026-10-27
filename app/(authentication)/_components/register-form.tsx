"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
    FieldTitle,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { registerSchema } from "../_schemas/registerSchema";
import { useRegister } from "../_hooks/useRegister";
import type { RegisterFormValues } from "../_types/registerTypes";
import { useRedirectIfLoggedIn } from "@/hooks/use-role-guard";

const ROLE_OPTIONS = [
    { value: "customer", title: "Customer", description: "Buy products" },
    { value: "seller", title: "Seller", description: "Sell products" },
] as const;

export function RegisterForm() {
    const { ready } = useRedirectIfLoggedIn();

    const [showPassword, setShowPassword] = useState(false);
    const { mutate: doRegister, isPending } = useRegister();

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
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

    const passwordToggle = (
        <InputGroupAddon align="inline-end">
            <InputGroupButton
                size="icon-xs"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
            >
                {showPassword ? <EyeOff /> : <Eye />}
            </InputGroupButton>
        </InputGroupAddon>
    );

    if (!ready) return null;

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
                        <InputGroup className="h-12 min-w-0 rounded-lg px-2">
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
                        <InputGroup className="h-12 min-w-0 rounded-lg px-2">
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
                            {passwordToggle}
                        </InputGroup>
                        {errors.password && (
                            <FieldError>{errors.password.message}</FieldError>
                        )}
                    </Field>

                    <Field data-invalid={!!errors.confirmPassword}>
                        <InputGroup className="h-12 min-w-0 rounded-lg px-2">
                            <InputGroupAddon>
                                <Lock />
                            </InputGroupAddon>
                            <InputGroupInput
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                disabled={isPending}
                                aria-invalid={!!errors.confirmPassword}
                                {...register("confirmPassword")}
                            />
                            {passwordToggle}
                        </InputGroup>
                        {errors.confirmPassword && (
                            <FieldError>{errors.confirmPassword.message}</FieldError>
                        )}
                    </Field>
                </FieldGroup>

                <Field>
                    <Button
                        type="submit"
                        size="lg"
                        className="h-12 w-full rounded-lg"
                        disabled={isPending}
                    >
                        {isPending ? "Loading..." : "Sign up"}
                    </Button>
                    <FieldDescription className="text-center">
                        Already have an account?{" "}
                        <Link href="/login" className="font-medium text-primary">
                            Back to login
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldSet>
        </form>
    );
}