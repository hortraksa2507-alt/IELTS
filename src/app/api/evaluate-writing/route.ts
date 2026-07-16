import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import {
  evaluateWriting,
  evaluateWritingEnsemble,
  PROMPT_VERSION,
  EVALUATOR_MODEL,
} from "@/lib/ielts/evaluator";
import type { WritingTaskType } from "@/lib/ielts/types";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { essay, prompt, taskType, submissionId, ensemble } = body as {
      essay: string;
      prompt: string;
      taskType: WritingTaskType;
      submissionId?: string;
      ensemble?: boolean;
    };

    if (!essay || !prompt || !taskType) {
      return NextResponse.json(
        { error: "Missing required fields: essay, prompt, taskType" },
        { status: 400 }
      );
    }

    if (
      taskType !== "TASK_2" &&
      taskType !== "TASK_1_ACADEMIC" &&
      taskType !== "TASK_1_GENERAL"
    ) {
      return NextResponse.json({ error: "Invalid taskType" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 503 }
      );
    }

    const input = { essay, prompt, taskType };
    const evaluation = ensemble
      ? await evaluateWritingEnsemble(input)
      : await evaluateWriting(input);

    if (submissionId) {
      const overallMid =
        (evaluation.overall.low + evaluation.overall.high) / 2;

      const rawResponse = JSON.parse(JSON.stringify({
        ...evaluation,
        model: EVALUATOR_MODEL,
        promptVersion: PROMPT_VERSION,
      })) as Prisma.InputJsonValue;

      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          content: essay,
          wordCount: evaluation.analysis.wordCount,
          paragraphCounts: evaluation.analysis.paragraphWordCounts as unknown as Prisma.InputJsonValue,
          status: "EVALUATED",
          completedAt: new Date(),
        },
      });

      await prisma.aiEvaluation.upsert({
        where: { submissionId },
        create: {
          submissionId,
          estimatedBandScore: overallMid,
          taskAchievement: evaluation.taskCriterion.feedback,
          coherenceCohesion: evaluation.coherenceCohesion.feedback,
          lexicalResource: evaluation.lexicalResource.feedback,
          grammaticalRange: evaluation.grammaticalRange.feedback,
          actionableFixes: evaluation.topFixes,
          rawResponse,
        },
        update: {
          estimatedBandScore: overallMid,
          taskAchievement: evaluation.taskCriterion.feedback,
          coherenceCohesion: evaluation.coherenceCohesion.feedback,
          lexicalResource: evaluation.lexicalResource.feedback,
          grammaticalRange: evaluation.grammaticalRange.feedback,
          actionableFixes: evaluation.topFixes,
          rawResponse,
        },
      });
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Writing evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate writing submission" },
      { status: 500 }
    );
  }
}
