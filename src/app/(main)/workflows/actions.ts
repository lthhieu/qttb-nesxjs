'use server'

import { sendRequest } from "@/lib/fetch-wrapper"
import { updateTag } from "next/cache"

export const handleCreateOrUpdateNewWorkflow = async (data: any, access_token: string, status: string, dataUpdate?: null | IWorkflow) => {
    const { name, version, steps } = data
    const res = await sendRequest<IBackendResponse<IWorkflow>>({
        url: status === "CREATE" ? `${process.env.NEXT_PUBLIC_BACKEND_URI}/workflows` : `${process.env.NEXT_PUBLIC_BACKEND_URI}/workflows/${dataUpdate?._id}`,
        method: status === "CREATE" ? "POST" : "PATCH",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        body: { name, version, steps }
    })
    updateTag('workflows')
    return res
}

export const handleDeleteNewWorkflow = async (_id: string, access_token: string) => {
    const res = await sendRequest<IBackendResponse<IWorkflow>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/workflows/${_id}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${access_token!}`,
        },
    })
    updateTag('workflows')
    return res
}