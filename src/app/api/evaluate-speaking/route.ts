import { NextRequest, NextResponse } from "next/server";
import { evaluateSpeakingTranscript } from "@/lib/ai/evaluator";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, question, submissionId } = body as {
      transcript: string;
      question: string;
      submissionId?: string;
    };

    if (!transcript || !question) {
      return NextResponse.json(
        { error: "Missing required fields: transcript, question" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 503 }
      );
    }

    const evaluation = await evaluateSpeakingTranscript(transcript, question);
    const bandScore =
      typeof evaluation.estimatedBandScore === "string"
        ? parseFloat(evaluation.estimatedBandScore)
        : evaluation.estimatedBandScore;

    if (submissionId) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          transcript,
          status: "EVALUATED",
          completedAt: new Date(),
        },
      });

      await prisma.aiEvaluation.upsert({
        where: { submissionId },
        create: {
          submissionId,
          estimatedBandScore: bandScore,
          taskAchievement: evaluation.fluencyCoherence,
          coherenceCohesion: evaluation.fluencyCoherence,
          lexicalResource: evaluation.lexicalResource,
          grammaticalRange: evaluation.grammaticalRange,
          actionableFixes: evaluation.actionableFixes,
          rawResponse: evaluation as object,
        },
        update: {
          estimatedBandScore: bandScore,
          taskAchievement: evaluation.fluencyCoherence,
          coherenceCohesion: evaluation.fluencyCoherence,
          lexicalResource: evaluation.lexicalResource,
          grammaticalRange: evaluation.grammaticalRange,
          actionableFixes: evaluation.actionableFixes,
          rawResponse: evaluation as object,
        },
      });
    }

    return NextResponse.json({
      ...evaluation,
      estimatedBandScore: bandScore,
    });
  } catch (error) {
    console.error("Speaking evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate speaking submission" },
      { status: 500 }
    );
  }
}
