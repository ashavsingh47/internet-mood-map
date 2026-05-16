"use client";

import { useState } from "react";
import type {
  MoodApiResponse,
  MoodDataMode,
  SourceSummary,
} from "@/types/mood";

type HistorySource = NonNullable<MoodApiResponse["historySource"]>;
type ExplanationSource = NonNullable<MoodApiResponse["explanationSource"]>;

type DataSourceStatusProps = {
  mode: MoodDataMode;
  historySource: HistorySource;
  explanationSource: ExplanationSource;
  sourceSummary?: SourceSummary;
  warnings: string[];
};

const MODE_STYLES: Record<MoodDataMode, { label: string; chip: string }> = {
  mock: {
    label: "Mock",
    chip: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  },
  "live-simulation": {
    label: "Live Simulation",
    chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
  hybrid: {
    label: "Hybrid",
    chip: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  },
  real: {
    label: "Real",
    chip: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  },
};

const HISTORY_STYLES: Record<HistorySource, { label: string; chip: string }> = {
  mock: {
    label: "Mock",
    chip: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  },
  database: {
    label: "Database",
    chip: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  },
};

const EXPLANATION_STYLES: Record<
  ExplanationSource,
  { label: string; chip: string }
> = {
  "rule-based": {
    label: "Rule-based",
    chip: "border-slate-400/30 bg-slate-400/10 text-slate-200",
  },
  openai: {
    label: "OpenAI",
    chip: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  },
  gemini: {
    label: "Gemini",
    chip: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  },
  mixed: {
    label: "Mixed",
    chip: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
};

type ChipProps = {
  label: string;
  value: string;
  chipClassName: string;
};

function Chip({ label, value, chipClassName }: ChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-3 pr-1 text-xs">
      <span className="font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <span
        className={`rounded-full border px-2.5 py-0.5 font-bold ${chipClassName}`}
      >
        {value}
      </span>
    </div>
  );
}

function SourceStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1 text-xs">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-white tabular-nums">{value}</span>
    </span>
  );
}

const MAX_VISIBLE_WARNINGS = 2;

export function DataSourceStatus({
  mode,
  historySource,
  explanationSource,
  sourceSummary,
  warnings,
}: DataSourceStatusProps) {
  const [showAllWarnings, setShowAllWarnings] = useState(false);

  const modeStyle = MODE_STYLES[mode];
  const historyStyle = HISTORY_STYLES[historySource];
  const explanationStyle = EXPLANATION_STYLES[explanationSource];

  const visibleWarnings = showAllWarnings
    ? warnings
    : warnings.slice(0, MAX_VISIBLE_WARNINGS);
  const hiddenWarningCount = Math.max(0, warnings.length - MAX_VISIBLE_WARNINGS);

  return (
    <div className="mb-4">
      <div className="glass-panel flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
        <Chip label="Mode" value={modeStyle.label} chipClassName={modeStyle.chip} />
        <Chip
          label="History"
          value={historyStyle.label}
          chipClassName={historyStyle.chip}
        />
        <Chip
          label="Explanation"
          value={explanationStyle.label}
          chipClassName={explanationStyle.chip}
        />

        {sourceSummary ? (
          <div className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <SourceStat label="Sources" value={sourceSummary.sourceCount} />
            <span className="text-slate-700" aria-hidden>
              ·
            </span>
            <SourceStat label="Signals" value={sourceSummary.signalCount} />
            <span className="text-slate-700" aria-hidden>
              ·
            </span>
            <SourceStat
              label="Matched"
              value={sourceSummary.matchedSignalCount}
            />
            {sourceSummary.unmatchedSignalCount > 0 ? (
              <>
                <span className="text-slate-700" aria-hidden>
                  ·
                </span>
                <SourceStat
                  label="Unmatched"
                  value={sourceSummary.unmatchedSignalCount}
                />
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {warnings.length > 0 ? (
        <div className="mt-2 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
              {warnings.length === 1
                ? "1 warning"
                : `${warnings.length} warnings`}
            </p>

            {hiddenWarningCount > 0 ? (
              <button
                type="button"
                onClick={() => setShowAllWarnings((current) => !current)}
                className="text-xs font-semibold text-amber-200 underline-offset-4 hover:underline"
              >
                {showAllWarnings ? "Show less" : `+${hiddenWarningCount} more`}
              </button>
            ) : null}
          </div>

          <ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100/80">
            {visibleWarnings.map((warning, index) => (
              <li key={`${index}-${warning.slice(0, 24)}`}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
