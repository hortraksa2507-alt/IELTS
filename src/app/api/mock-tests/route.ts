import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleType = searchParams.get("module");
    const testType = searchParams.get("testType");

    const tests = await prisma.mockTest.findMany({
      where: {
        isPublished: true,
        ...(moduleType ? { module: moduleType as "READING" | "LISTENING" | "WRITING" | "SPEAKING" } : {}),
        ...(testType
          ? { testType: testType as "ACADEMIC" | "GENERAL_TRAINING" }
          : {}),
      },
      include: {
        readingPassage: true,
        writingPrompt: true,
        listeningTest: true,
        speakingPrompts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error("Fetch mock tests error:", error);
    return NextResponse.json({ error: "Failed to fetch mock tests" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const test = await prisma.mockTest.create({ data: body });
    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error("Create mock test error:", error);
    return NextResponse.json({ error: "Failed to create mock test" }, { status: 500 });
  }
}
