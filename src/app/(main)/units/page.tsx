import TableUnits from "@/components/units/table";
import TableWorkflows from "@/components/workflows/table";
import { auth } from "@/lib/auth";
import { sendRequest } from "@/lib/fetch-wrapper";
import { headers } from "next/headers";

type Params = Promise<{ page: string; limit: string }>

export default async function Units({ searchParams }: { searchParams: Params }) {
    const { limit = 5, page = 1 } = await searchParams
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const res = await sendRequest<IBackendResponse<IPaginate<IUnit[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/units`,
        queryParams: { page, limit },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
        nextOption: {
            next: { tags: ['units'] }
        }
    })

    //@ts-ignore
    if (session?.user.role !== '692027387acdfd5a8a9691ad') {
        return 'Chỉ có admin mới có quyền truy cập endpoint này'
    }

    return (
        <div>
            <TableUnits
                access_token={session?.access_token ?? ''}
                meta={res?.data?.meta!}
                units={res?.data?.result ?? []} />
        </div>
    );
}
