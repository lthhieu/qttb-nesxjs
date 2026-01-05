'use server'

import { sendRequestFile } from "@/lib/fetch-wrapper"
import { updateTag } from "next/cache"

export const handleUploadFile = async (formData: FormData) => {
    const res = await sendRequestFile<IBackendResponse<IFile>>({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URI}/files/upload`,
        method: 'post',
        body: formData,
        headers: { "folder_type": "documents" }
    })
    return res
}