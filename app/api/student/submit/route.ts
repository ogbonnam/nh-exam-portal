// app/api/student/submit/route.ts
import { NextResponse } from "next/server";
import { submitQuiz } from "@/app/student/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId } = body;
    if (!attemptId) return NextResponse.json({ error: "Missing attemptId" }, { status: 400 });

    const res = await submitQuiz(attemptId);
    if (res?.error) {
      return NextResponse.json(res, { status: 400 });
    }
    return NextResponse.json(res);
  } catch (err) {
    console.error("API submit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
