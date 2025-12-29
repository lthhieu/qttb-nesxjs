import TableWorkflows from "@/components/workflows/table";
import { auth } from "@/lib/auth";
import { sendRequest } from "@/lib/fetch-wrapper";
import { headers } from "next/headers";

type Params = Promise<{ page: string; limit: string }>

export default async function Workflows({ searchParams }: { searchParams: Params }) {
    const { limit = 5, page = 1 } = await searchParams
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const res = await sendRequest<IBackendResponse<IPaginate<IWorkflow[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/workflows/by-unit`,
        queryParams: { page, limit },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { tags: ['workflows'] }
        }
    })
    const res1 = await sendRequest<IBackendResponse<IPaginate<IUnit[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/units`,
        queryParams: { page, limit },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { tags: ['units'] }
        }
    })
    const res2 = await sendRequest<IBackendResponse<IPaginate<IUnit[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/positions`,
        queryParams: { page, limit: 100 },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { tags: ['positions'] }
        }
    })
    // console.log(res.data?.result)
    return (
        <div>
            <TableWorkflows
                access_token={session?.access_token ?? ''}
                units={res1?.data?.result ?? []}
                meta={res?.data?.meta!}
                positions={res2?.data?.result ?? []}
                workflows={res?.data?.result ?? []} />
        </div>
    );
}
