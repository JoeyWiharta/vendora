import { RegisterForm } from "../_components/register-form";

export default function RegisterPage() {
    return (
        <>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
                <p className="text-muted-foreground">
                    Sign up as a customer or a seller.
                </p>
            </div>
            <RegisterForm />
        </>
    );
}