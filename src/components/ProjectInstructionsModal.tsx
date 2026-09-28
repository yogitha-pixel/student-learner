import React from 'react';
import {
  BookOpen,
  Terminal,
  Server,
  Layers,
  CheckCircle2,
  Key,
  FolderTree,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const ProjectInstructionsModal: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = React.useState(false);

  const localRunCode = `# 1. Install dependencies
npm install

# 2. Configure Gemini API Key (optional, smart fallback included)
echo "GEMINI_API_KEY=YOUR_GEMINI_API_KEY" > .env

# 3. Start development server on port 3000
npm run dev

# 4. Or build for production
npm run build
npm start`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(localRunCode);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              FoodWise – Project Execution &amp; Run Guide
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Clear instructions on how this application works and how to run it locally or deploy.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Start Commands */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Terminal className="w-4 h-4" />
            <span>Bash / Terminal Setup Commands</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="text-xs font-semibold px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCmd ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>

        <pre className="font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto p-2 leading-relaxed">
          {localRunCode}
        </pre>
      </div>

      {/* Step by Step Setup Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 & 2 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              1
            </div>
            <span>Prerequisites &amp; Installation</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Node.js:</strong> Ensure Node.js v18+ or v20+ is installed on your computer (<code className="bg-slate-100 px-1 py-0.5 rounded">node -v</code>).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Install Dependencies:</strong> Run <code className="bg-slate-100 px-1 py-0.5 rounded">npm install</code> to download Express, Vite, React, and Tailwind CSS.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Peer Dependency Note:</strong> A <code className="bg-slate-100 px-1 py-0.5 rounded">.npmrc</code> with <code className="bg-slate-100 px-1 py-0.5 rounded">legacy-peer-deps=true</code> is already configured to prevent esbuild conflicts during Vercel/CI builds.
              </span>
            </li>
          </ul>
        </div>

        {/* Step 3 & 4 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base border-b border-slate-100 pb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              2
            </div>
            <span>Backend &amp; Database Architecture</span>
          </div>

          <ul className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <Server className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Express Server (server.ts):</strong> Serves REST endpoints for adding, updating, calculating analytics, and deleting waste logs.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <FolderTree className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Persistent Database:</strong> Records are saved to <code className="bg-slate-100 px-1 py-0.5 rounded">./data/records.json</code>, preserving all campus records across reboots without requiring complicated SQL setup!
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Key className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Gemini AI Integration:</strong> Uses <code className="bg-slate-100 px-1 py-0.5 rounded">@google/genai</code> with model <code className="bg-slate-100 px-1 py-0.5 rounded">gemini-3.8-flash</code>. If an API key is not supplied, a smart diagnostic fallback engine automatically activates.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Features Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base">Key Application Modules Implemented:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">🏠 Home / Dashboard</div>
            <p className="text-slate-500">Daily, weekly, monthly KPIs, top wasted food alert, and environmental impact cards.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">➕ Add Food Waste</div>
            <p className="text-slate-500">Food name, weight/unit, cost, meal type, reason, and student vs canteen staff role.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">📜 Waste History</div>
            <p className="text-slate-500">Full logs list, live search, multi-filters, sorting, record editing, and CSV spreadsheet export.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">📊 Statistics &amp; Charts</div>
            <p className="text-slate-500">Daily trend bar chart, meal service distribution, top wasted food leaderboard, and root-cause breakdown.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">🤖 AI Suggestions</div>
            <p className="text-slate-500">Gemini 3.8 Flash operational recommendations for canteens, student plate tips, and interactive Q&amp;A chat.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-bold text-slate-900">🌱 Progress Improvement</div>
            <p className="text-slate-500">Week-over-week reduction percentages, milestones, and campus sustainability semester targets.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
