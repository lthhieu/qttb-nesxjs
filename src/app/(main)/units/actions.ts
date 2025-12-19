'use server'

import { sendRequest } from "@/lib/fetch-wrapper"
import { updateTag } from "next/cache"

export const handleCreateOrUpdateUnit = async (data: any, access_token: string, status: string, dataUpdate?: null | IUnit) => {
    const { name } = data
    const res = await sendRequest<IBackendResponse<IUnit>>({
        url: status === "CREATE" ? `${process.env.NEXT_PUBLIC_BACKEND_URI}/units` : `${process.env.NEXT_PUBLIC_BACKEND_URI}/units/${dataUpdate?._id}`,
        method: status === "CREATE" ? "POST" : "PATCH",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        body: { name }
    })
    updateTag('units')
    return res
}

export const handleDeleteUnit = async (_id: string, access_token: string) => {
    const res = await sendRequest<IBackendResponse<IWorkflow>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/units/${_id}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${access_token!}`,
        },
    })
    updateTag('units')
    return res
}