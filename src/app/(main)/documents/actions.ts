'use server'

import { sendRequestFile } from "@/lib/fetch-wrapper"

export const handleUploadFile = async (formData: FormData) => {
    const res = await sendRequestFile<IBackendResponse<IFile>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/files/upload`,
        method: 'post',
        body: formData,
        headers: { "folder_type": "documents" }
    })
    return res
}