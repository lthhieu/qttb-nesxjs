'use client'

import { authClient } from "@/lib/auth-client"

const TestPAge = () => {
    const {
        data: session,
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession()
    const handleSignout = async () => {
        await authClient.signOut();
    }
    return (
        <>
            {session ? <>
                <div>Hello {session?.user.name}</div>
                <p>{session?.user.email}</p>
                <button onClick={handleSignout}>Đăng xuất</button></> : <p>Chưa đăng nhập</p>}
        </>
    )
}
export default TestPAge