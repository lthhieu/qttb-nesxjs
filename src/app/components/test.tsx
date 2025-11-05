'use client'

import { authClient } from "@/lib/auth-client"
import { Button } from "antd"
import { io } from "socket.io-client";

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
    const clickMe = async () => {
        const socket = io('http://localhost:8000');
        socket.emit('events', { name: 'Hello server!' }, (data:any) =>  alert(data));
    }
    return (
        <>
            {session ? <>
                <div>Hello {session?.user.name}</div>
                <p>{session?.user.email}</p>
                <button onClick={handleSignout}>Đăng xuất</button></> : <p>Chưa đăng nhập</p>}<br />
                <Button onClick={()=>clickMe()} color="pink" variant="solid">Socket io</Button>
        </>
    )
}
export default TestPAge