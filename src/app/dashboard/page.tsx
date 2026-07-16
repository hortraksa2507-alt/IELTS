import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-ielts-navy text-white px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm hover:underline">
          ← Home
        </Link>
        <h1 className="font-semibold">Dashboard</h1>
        <div className="w-16" />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-ielts-navy mb-4">Your Progress</h2>
          <p className="text-slate-600 mb-8">
            Connect a PostgreSQL database and configure your Anthropic API key to enable
            full progress tracking and submission history.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Current Band", value: "5.0", sub: "Target: 7.0" },
              { label: "Tests Completed", value: "0", sub: "Start practicing" },
              { label: "Writing Evaluations", value: "0", sub: "AI-powered feedback" },
            ].map((stat) => (
              <div key={stat.label} className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase">{stat.label}</p>
                <p className="text-3xl font-bold text-ielts-navy mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="text-left bg-slate-50 rounded-lg p-6 space-y-3">
            <h3 className="font-semibold text-ielts-navy">Setup Instructions</h3>
            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-2">
              <li>Copy <code className="bg-slate-200 px-1 rounded">.env.example</code> to <code className="bg-slate-200 px-1 rounded">.env</code></li>
              <li>Set your <code className="bg-slate-200 px-1 rounded">DATABASE_URL</code> for PostgreSQL</li>
              <li>Set your <code className="bg-slate-200 px-1 rounded">ANTHROPIC_API_KEY</code> for AI evaluation</li>
              <li>Run <code className="bg-slate-200 px-1 rounded">npm run db:push && npm run db:seed</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
