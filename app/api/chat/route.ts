import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { answerQuery } from "@/lib/matcher";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        {
          error:
            'Send JSON like { "message": "hello" }',
        },
        {
          status: 400,
          headers: CORS,
        }
      );
    }

    // =========================
    // FIRST: CHECK LOCAL DATASET
    // =========================

    let localAnswer = { reply: "" };
try {
  localAnswer = answerQuery(message);
} catch (e) {
  console.error("Matcher crashed:", e);
}

    // If good dataset answer exists
    if (
      localAnswer.reply &&
      !localAnswer.reply.includes(
        "Sorry, I could not find"
      )
    ) {
      return NextResponse.json(localAnswer, {
        headers: CORS,
      });
    }

    // =========================
    // SECOND: FALLBACK TO GEMINI
    // =========================

    const result = await model.generateContent(`
You are KI-Khobor, an AI campus assistant for Tetso College.

Rules:
- Be concise
- Be student-friendly
- Give accurate academic help
- If unsure, say you do not know
- Avoid hallucinating fake campus information

Student Question:
${message}
    `);

    const response = result.response.text();

    return NextResponse.json(
      {
        reply: response,
      },
      {
        headers: CORS,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
        headers: CORS,
      }
    );
  }
}