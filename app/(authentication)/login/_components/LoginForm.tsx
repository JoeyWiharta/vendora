"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet, FieldSeparator } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema } from "../_schemas/loginSchema";
import { useLogin } from "../_hooks/useLogin";
import type { LoginFormValues } from "../_types/loginTypes";
import { Spinner } from "@/components/ui/spinner";

const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { mutate: doLogin, isPending } = useLogin();
    const { register, control, handleSubmit, formState: { errors }, reset } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
            rememberMe: true,
        },
    });

    useEffect(() => {
        setShowPassword(false)
        reset();
    }, [reset]);

    const onSubmit = handleSubmit((values) => {
        doLogin(values)
    });

    return (
        <form onSubmit={onSubmit} noValidate className="w-full min-w-0">
            <FieldSet className="flex min-w-0 flex-col gap-6">
                <FieldGroup className="flex min-w-0 flex-col gap-4">
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
                                autoComplete="current-password"
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
                        {errors.password && (<FieldError>{errors.password.message}</FieldError>)}
                    </Field>

                    <Field orientation="horizontal" className="items-center gap-2">
                        <Controller
                            name="rememberMe"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    id="rememberMe"
                                    checked={field.value}
                                    onCheckedChange={(checked) => field.onChange(checked === true)}
                                    disabled={isPending}
                                />
                            )}
                        />
                        <FieldLabel htmlFor="rememberMe" className="font-normal text-muted-foreground">
                            Remember me
                        </FieldLabel>
                    </Field>
                </FieldGroup>

                <Field className="gap-4">
                    <Button type="submit" size="lg" disabled={isPending}
                    >
                        {isPending && <Spinner />}
                        {isPending ? "Loading..." : "Login"}
                    </Button>

                    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or</FieldSeparator>

                    <FieldDescription className="text-center">
                        Don't have an account?
                        <Link href="/register" className="font-medium text-primary ml-1">
                            Sign up
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldSet>
        </form>
    );
}
export default LoginForm;