"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { loginSchema } from "../_schemas/loginSchema";
import { useLogin } from "../_hooks/useLogin";
import type { LoginFormValues } from "../_types/loginTypes";
import { Separator } from "@/components/ui/separator";

const LoginForm = () => {

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const { mutate: doLogin, isPending } = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = handleSubmit((values) => {
        doLogin({ email: values.email, password: values.password, rememberMe });
    });



    return (
        <form onSubmit={onSubmit} noValidate className="w-full min-w-0">
            <FieldSet className="flex min-w-0 flex-col gap-6">
                <FieldGroup className="flex min-w-0 flex-col gap-4">
                    <Field data-invalid={!!errors.email}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
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
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <InputGroup className="h-12 min-w-0 rounded-lg px-2">
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
                                    size="icon-xs"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </InputGroupButton>
                            </InputGroupAddon>
                        </InputGroup>
                        {errors.password && (
                            <FieldError>{errors.password.message}</FieldError>
                        )}
                    </Field>

                    <Field orientation="horizontal" className="items-center gap-2">
                        <Checkbox
                            id="rememberMe"
                            checked={rememberMe}
                            onCheckedChange={(checked) => setRememberMe(checked === true)}
                            disabled={isPending}
                        />
                        <FieldLabel htmlFor="rememberMe" className="font-normal text-muted-foreground">
                            Remember me
                        </FieldLabel>
                    </Field>
                </FieldGroup>

                <Field>
                    <Button
                        type="submit"
                        size="lg"
                        className="h-12 w-full rounded-lg"
                        disabled={isPending}
                    >
                        {isPending ? "Loading..." : "Log in"}
                    </Button>

                    <Separator />

                    <FieldDescription className="text-center">
                        Don&apos;t have an account?{" "}
                        <Link href="/register" className="font-medium text-primary">
                            Sign up
                        </Link>
                    </FieldDescription>
                </Field>
            </FieldSet>
        </form>
    );
}
export default LoginForm;