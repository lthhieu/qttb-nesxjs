import TableUsers from "@/components/users/table";
import { auth } from "@/lib/auth";
import { sendRequest } from "@/lib/fetch-wrapper";
import { headers } from "next/headers";

type Params = Promise<{ page: string; limit: string }>
const Users = async ({ searchParams }: { searchParams: Params }) => {
    const { limit = 5, page = 1 } = await searchParams
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const res = await sendRequest<IBackendResponse<IPaginate<IUser[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/users`,
        queryParams: { page, limit },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { tags: ['users'] }
        }
    })
    const res1 = await sendRequest<IBackendResponse<IUnit[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/units`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
    })
    const res2 = await sendRequest<IBackendResponse<IUnit[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/positions`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
    })
    const res3 = await sendRequest<IBackendResponse<IUnit[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/roles`,
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
    })
    return (
        <div>
            <TableUsers
                access_token={session?.access_token ?? ''}
                units={res1?.data ?? []}
                roles={res3?.data ?? []}
                meta={res?.data?.meta!}
                positions={res2?.data ?? []}
                users={res?.data?.result ?? []} />
        </div>
    )
}
export default Users