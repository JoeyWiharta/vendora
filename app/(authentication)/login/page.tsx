import LoginForm from "../_components/LoginForm";

const LoginPage = () => {
    return (
        <>
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                <p className="text-muted-foreground">
                    Log in to your account to continue your shopping journey.
                </p>
            </div>
            <LoginForm />
        </>
    );
}
export default LoginPage;