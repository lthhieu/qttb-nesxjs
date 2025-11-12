import LoginComponent from "@/components/auth/login"
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from "next/navigation";

const LoginPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    if (session) {
        return redirect('/')
    }
    return (
        <div>
            <LoginComponent />
        </div>
    )
}
export default LoginPage