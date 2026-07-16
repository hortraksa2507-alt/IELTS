import { analyzeWriting } from "../src/lib/ielts/analyze";

const SAMPLE_ESSAY = `Technology has changed modern life in many ways. Some people believe that technology has made our lives more complicated, while others think it has made life easier. This essay will discuss both views before giving my own opinion.

On one hand, technology has created a plethora of problems for many people. People must learn new skills skills skills to use smartphones and computers. The ubiquitous presence of social media can make people feel stressed. For example, workers often receive emails outside office hours, which blurs the boundary between work and personal life.

On the other hand, technology has clearly made daily tasks easier. Online banking saves time, and video calls help families stay connected across long distances. A student in a rural area can now access university lectures online, which was impossible twenty years ago.

In conclusion, although technology brings some complications, I believe it has made life easier overall because the benefits to communication and convenience outweigh the drawbacks.`;

const analysis = analyzeWriting(
  SAMPLE_ESSAY,
  "TASK_2",
  "Some people believe that technology has made our lives more complicated, while others think it has made life easier. Discuss both views and give your own opinion."
);

const checks = [
  { name: "4 paragraphs", pass: analysis.paragraphCount === 4 },
  { name: "conclusion marker", pass: analysis.hasConclusionMarker },
  { name: "repeated word (skills)", pass: analysis.repeatedWords.some((w) => w.word === "skills") },
  {
    name: "memorized phrase: a plethora of",
    pass: analysis.memorizedPhrases.some((p) => p.phrase === "a plethora of"),
  },
  {
    name: "memorized phrase: ubiquitous",
    pass: analysis.memorizedPhrases.some((p) => p.phrase === "ubiquitous"),
  },
  { name: "under 250 words", pass: !analysis.meetsMinWordCount },
];

console.log("=== analyzeWriting smoke test ===\n");
console.log(JSON.stringify(analysis, null, 2));
console.log("\n=== checks ===");
for (const check of checks) {
  console.log(`${check.pass ? "PASS" : "FAIL"} — ${check.name}`);
}

const failed = checks.filter((c) => !c.pass);
if (failed.length > 0) {
  console.error(`\n${failed.length} check(s) failed`);
  process.exit(1);
}

console.log("\nAll checks passed.");
