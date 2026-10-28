import { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import RegisterForm from "../_components/RegisterForm";

const RegisterPage = () => {
    return (
        <>
            <CardHeader>
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>
                    Join Vendora to discover products or start selling.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RegisterForm />
            </CardContent>
        </>
    );
};

export default RegisterPage;