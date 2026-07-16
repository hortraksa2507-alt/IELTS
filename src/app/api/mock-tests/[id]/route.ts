import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const test = await prisma.mockTest.findUnique({
      where: { id },
      include: {
        readingPassage: true,
        writingPrompt: true,
        listeningTest: true,
        speakingPrompts: true,
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Mock test not found" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("Fetch mock test error:", error);
    return NextResponse.json({ error: "Failed to fetch mock test" }, { status: 500 });
  }
}
