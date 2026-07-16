import Link from "next/link";

const modules = [
  {
    title: "Reading",
    description:
      "Split-screen CD-IELTS simulator with highlighting, keyword technique training, and T/F/NG diagnostic logic.",
    href: "/practice/reading",
    icon: "📖",
    color: "bg-blue-600",
  },
  {
    title: "Writing",
    description:
      "Structured essay blueprints with Coffee Shop ideation, PEEL framework, Birthday Cake lexical analysis, and AI grading.",
    href: "/practice/writing",
    icon: "✍️",
    color: "bg-ielts-red",
  },
  {
    title: "Listening",
    description:
      "Single-playback audio simulation with strict word limits, exact spelling enforcement, and distractor training.",
    href: "/practice/listening",
    icon: "🎧",
    color: "bg-purple-600",
  },
  {
    title: "Speaking",
    description:
      "PELL framework for Parts 1 & 3, 5-Heading Strategy for Part 2, with AI transcript evaluation.",
    href: "/practice/speaking",
    icon: "🎤",
    color: "bg-green-600",
  },
];

const principles = [
  {
    title: "Structure Over Tricks",
    text: "Four-paragraph essays, PEEL body paragraphs, and rigid Task 1 formats — not memorized hacks.",
  },
  {
    title: "Birthday Cake Vocabulary",
    text: "90% simple accurate words (A1–B2), 5–10% advanced sprinkles (C1–C2). Clarity beats complexity.",
  },
  {
    title: "Exam-Exact Simulation",
    text: "Disabled spell-check, split-screen reading, single audio playback, and final-minute timer behavior.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="bg-ielts-navy text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <p className="text-sm uppercase tracking-wider text-blue-200 mb-3">
            IELTS Advantage Methodology
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI-Powered IELTS Preparation Platform
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mb-8">
            Train with the exact Computer-Delivered IELTS interface. Get examiner-grade
            AI feedback based on official Band Descriptors — not generic tips.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/practice/writing"
              className="px-6 py-3 bg-ielts-red text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Start Writing Practice
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition border border-white/20"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-ielts-navy mb-8">Practice Modules</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {modules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className="group bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-slate-300 transition"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`${mod.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}
                >
                  {mod.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-ielts-navy group-hover:text-ielts-red transition">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">{mod.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-ielts-navy mb-8">
            Core Pedagogical Principles
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {principles.map((p) => (
              <div key={p.title}>
                <h3 className="font-semibold text-ielts-navy mb-2">{p.title}</h3>
                <p className="text-sm text-slate-600">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-center text-sm text-slate-500">
        Built on the IELTS Advantage methodology by Chris Pell
      </footer>
    </div>
  );
}
