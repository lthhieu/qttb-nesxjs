import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, res: NextResponse) {
    return NextResponse.json({ mess: 'tui là nextjs server' })
}