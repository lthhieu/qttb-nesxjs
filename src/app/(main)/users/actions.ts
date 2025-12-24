'use server'

import { sendRequest, sendRequestFile } from "@/lib/fetch-wrapper"
import { updateTag } from 'next/cache'

export const handleCreateOrUpdateUser = async (data: any, access_token: string, status: string, dataUpdate?: null | IUser) => {
    const { name, unit, position, role, p12, email } = data
    const body: any = { email, name, unit, position, role }

    if (p12 && p12.trim() !== '') {
        body.p12 = p12
    }
    const res = await sendRequest<IBackendResponse<IUser>>({
        url: status === "CREATE" ? `${process.env.NEXT_PUBLIC_BACKEND_URI}/users` : `${process.env.NEXT_PUBLIC_BACKEND_URI}/users/${dataUpdate?._id}`,
        method: status === "CREATE" ? "POST" : "PATCH",
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        body
    })
    updateTag('users')
    return res
}

export const handleDeleteUser = async (_id: string, access_token: string) => {
    const res = await sendRequest<IBackendResponse<IUser>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/users/${_id}`,
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${access_token!}`,
        },
    })
    updateTag('users')
    return res
}

export const handleUploadFileP12 = async (formData: FormData) => {
    const res = await sendRequestFile<IBackendResponse<IFile>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/files/upload`,
        method: 'post',
        body: formData,
        headers: { "folder_type": "certs" }
    })
    return res
}