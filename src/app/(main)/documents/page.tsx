import TableDocuments from "@/components/documents/table";
import ViewPdf from "@/components/documents/view.pdf";
import { auth } from "@/lib/auth";
import { sendRequest } from "@/lib/fetch-wrapper";
import { headers } from "next/headers";
type Params = Promise<{ page: string; limit: string }>

export default async function Documents({ searchParams }: { searchParams: Params }) {
    const { limit = 5, page = 1 } = await searchParams
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    const res = await sendRequest<IBackendResponse<IPaginate<IDocument[]>>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/documents`,
        queryParams: { page, limit },
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
    })
    const res1 = await sendRequest<IBackendResponse<IWorkflow[]>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/workflows/by-unit`,
        headers: {
            Authorization: `Bearer ${session?.access_token}`,
        },
    })
    return (
        <div>
            {/* <ViewPdf /> */}
            <TableDocuments
                access_token={session?.access_token ?? ''}
                workflows={res1?.data ?? []}
                meta={res?.data?.meta!}

                documents={res?.data?.result ?? []} />
        </div>
    );
}
