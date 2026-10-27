import {LoginForm}  from "../_components/login-form";

export default function LoginPage() {
    return (
        <>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground">
                    Log in to your account to continue your shopping journey.
                </p>
            </div>
            <LoginForm />
        </>
    );
}