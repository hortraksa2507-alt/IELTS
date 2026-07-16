import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { countWords } from "@/store/simulator-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const mockTestId = searchParams.get("mockTestId");

    if (userId) {
      const submissions = await prisma.submission.findMany({
        where: { userId },
        include: { evaluation: true, mockTest: true },
        orderBy: { startedAt: "desc" },
      });
      return NextResponse.json(submissions);
    }

    if (mockTestId) {
      const submissions = await prisma.submission.findMany({
        where: { mockTestId },
        include: { evaluation: true },
        orderBy: { startedAt: "desc" },
      });
      return NextResponse.json(submissions);
    }

    const submissions = await prisma.submission.findMany({
      include: { evaluation: true, mockTest: true, user: true },
      orderBy: { startedAt: "desc" },
      take: 50,
    });
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Fetch submissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, mockTestId, content, answers, transcript, audioUrl, paragraphCounts } =
      body as {
        userId: string;
        mockTestId: string;
        content?: string;
        answers?: Record<string, string>;
        transcript?: string;
        audioUrl?: string;
        paragraphCounts?: Record<string, number>;
      };

    if (!userId || !mockTestId) {
      return NextResponse.json(
        { error: "Missing required fields: userId, mockTestId" },
        { status: 400 }
      );
    }

    const submission = await prisma.submission.create({
      data: {
        userId,
        mockTestId,
        content,
        answers: answers ?? undefined,
        transcript,
        audioUrl,
        wordCount: content ? countWords(content) : 0,
        paragraphCounts: paragraphCounts ?? undefined,
        status: "SUBMITTED",
        completedAt: new Date(),
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Create submission error:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
