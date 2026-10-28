import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LoginForm from "../_components/LoginForm";

const LoginPage = () => {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Welcome back</CardTitle>
                <CardDescription>
                    Log in to your account to continue shopping.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
        </>
    );
}
export default LoginPage;