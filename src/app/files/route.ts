
//http://localhost:8000/files/default/sample-1761810515320.pdf

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const url = new URL(req.url)
    const searchParams = new URLSearchParams(url.search)
    const filename = searchParams.get("name")
    const folder = searchParams.get("folder")

    return await fetch(`${process.env.NEXT_PUBLIC_BE_REMOTE}/files/${folder}/${filename}`)
}