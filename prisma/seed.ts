import { PrismaClient, TestType, ModuleType, WritingTaskType, SpeakingPart } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@ieltsadvantage.com" },
    update: {},
    create: {
      email: "demo@ieltsadvantage.com",
      name: "Demo Student",
      currentBand: 5.5,
      targetBand: 7.0,
      testType: TestType.ACADEMIC,
    },
  });

  const readingTest = await prisma.mockTest.create({
    data: {
      title: "Reading Test 1 — Urban Green Spaces",
      testType: TestType.ACADEMIC,
      module: ModuleType.READING,
      duration: 3600,
      readingPassage: {
        create: {
          title: "The History of Urban Green Spaces",
          content: "Sample reading passage content...",
          questions: [],
        },
      },
    },
  });

  const writingTask2 = await prisma.mockTest.create({
    data: {
      title: "Writing Task 2 — Technology Essay",
      testType: TestType.ACADEMIC,
      module: ModuleType.WRITING,
      duration: 2400,
      writingPrompt: {
        create: {
          taskType: WritingTaskType.TASK_2,
          prompt:
            "Some people believe that technology has made our lives more complicated, while others think it has made life easier. Discuss both views and give your own opinion.",
          minWords: 250,
          maxWords: 300,
        },
      },
    },
  });

  const speakingTest = await prisma.mockTest.create({
    data: {
      title: "Speaking Test 1",
      testType: TestType.ACADEMIC,
      module: ModuleType.SPEAKING,
      duration: 900,
      speakingPrompts: {
        create: [
          {
            part: SpeakingPart.PART_1,
            question: "Do you enjoy reading books?",
          },
          {
            part: SpeakingPart.PART_2,
            question: "Describe a place in your city that you like to visit.",
            cueCard: {
              topic: "Describe a place in your city that you like to visit.",
              bulletPoints: [
                "where it is",
                "how often you go there",
                "what you do there",
                "and explain why you like this place",
              ],
            },
          },
          {
            part: SpeakingPart.PART_3,
            question: "Why do you think green spaces are important in cities?",
            followUps: [
              "Do you think cities will have more or fewer parks in the future?",
            ],
          },
        ],
      },
    },
  });

  console.log("Seed completed:", {
    demoUser: demoUser.email,
    readingTest: readingTest.id,
    writingTask2: writingTask2.id,
    speakingTest: speakingTest.id,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
