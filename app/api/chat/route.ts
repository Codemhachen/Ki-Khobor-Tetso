import { NextResponse } from "next/server";
import { answerQuery } from "@/lib/matcher";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: 'Send a JSON body like { "message": "your question" }' },
        { status: 400, headers: CORS }
      );
    }
    return NextResponse.json(answerQuery(message), { headers: CORS });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400, headers: CORS });
  }
}