// app/api/student/save-answers/route.ts
import { NextResponse } from "next/server";
import { saveAnswers } from "@/app/student/actions";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, answers } = body;
    if (!attemptId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Missing attemptId or answers" }, { status: 400 });
    }
    const res = await saveAnswers(attemptId, answers);
    if (res?.error) return NextResponse.json(res, { status: 400 });
    return NextResponse.json(res);
  } catch (err) {
    console.error("API save-answers error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
