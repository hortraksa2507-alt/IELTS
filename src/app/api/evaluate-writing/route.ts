import { NextRequest, NextResponse } from "next/server";
import {
  evaluateWritingTask2,
  evaluateWritingTask1Academic,
  evaluateWritingTask1General,
} from "@/lib/ai/evaluator";
import { prisma } from "@/lib/prisma";
import { countWords } from "@/store/simulator-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { essay, prompt, taskType, submissionId } = body as {
      essay: string;
      prompt: string;
      taskType: "TASK_2" | "TASK_1_ACADEMIC" | "TASK_1_GENERAL";
      submissionId?: string;
    };

    if (!essay || !prompt || !taskType) {
      return NextResponse.json(
        { error: "Missing required fields: essay, prompt, taskType" },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 503 }
      );
    }

    let evaluation;
    switch (taskType) {
      case "TASK_2":
        evaluation = await evaluateWritingTask2(essay, prompt);
        break;
      case "TASK_1_ACADEMIC":
        evaluation = await evaluateWritingTask1Academic(essay, prompt);
        break;
      case "TASK_1_GENERAL":
        evaluation = await evaluateWritingTask1General(essay, prompt);
        break;
      default:
        return NextResponse.json({ error: "Invalid taskType" }, { status: 400 });
    }

    const bandScore =
      typeof evaluation.estimatedBandScore === "string"
        ? parseFloat(evaluation.estimatedBandScore)
        : evaluation.estimatedBandScore;

    if (submissionId) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          content: essay,
          wordCount: countWords(essay),
          status: "EVALUATED",
          completedAt: new Date(),
        },
      });

      await prisma.aiEvaluation.upsert({
        where: { submissionId },
        create: {
          submissionId,
          estimatedBandScore: bandScore,
          taskAchievement: evaluation.taskResponse,
          coherenceCohesion: evaluation.coherenceCohesion,
          lexicalResource: evaluation.lexicalResource,
          grammaticalRange: evaluation.grammaticalRange,
          actionableFixes: evaluation.actionableFixes,
          rawResponse: evaluation as object,
        },
        update: {
          estimatedBandScore: bandScore,
          taskAchievement: evaluation.taskResponse,
          coherenceCohesion: evaluation.coherenceCohesion,
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
    console.error("Writing evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate writing submission" },
      { status: 500 }
    );
  }
}
