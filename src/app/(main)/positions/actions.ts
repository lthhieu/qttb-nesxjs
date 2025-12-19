'use server'

import { sendRequest } from "@/lib/fetch-wrapper"
import { updateTag } from "next/cache"

export const handleCreateOrUpdatePosition = async (data: any, access_token: string, status: string, dataUpdate?: null | IUnit) => {
    const { name } = data
    const res = await sendRequest<IBackendResponse<IUnit>>({
        url: status === "CREATE" ? `${process.env.NEXT_PUBLIC_BACKEND_URI}/positions` : `${process.env.NEXT_PUBLIC_BACKEND_URI}/positions/${dataUpdate?._id}`,
        method: status === "CREATE" ? "POST" : "PATCH",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        body: { name }
    })
    updateTag('positions')
    return res
}

export const handleDeletePosition = async (_id: string, access_token: string) => {
    const res = await sendRequest<IBackendResponse<IWorkflow>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/positions/${_id}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${access_token!}`,
        },
    })
    updateTag('positions')
    return res
}