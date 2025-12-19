import TablePositions from "@/components/positions/table";
import { auth } from "@/lib/auth";
import { sendRequest } from "@/lib/fetch-wrapper";
import { headers } from "next/headers";

type Params = Promise<{ page: string; limit: string }>

export default async function Positions({ searchParams }: { searchParams: Params }) {
    const { limit = 5, page = 1 } = await searchParams
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const res = await sendRequest<IBackendResponse<IPaginate<IUnit[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/positions`,
        queryParams: { page, limit },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { tags: ['positions'] }
        }
    })

    //@ts-ignore
    if (session?.user.role !== '692027387acdfd5a8a9691ad') {
        return 'Chỉ có admin mới có quyền truy cập endpoint này'
    }

    return (
        <div>
            <TablePositions
                access_token={session?.access_token ?? ''}
                meta={res?.data?.meta!}
                positions={res?.data?.result ?? []} />
        </div>
    );
}
