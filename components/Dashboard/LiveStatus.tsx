"use client";

import { useEffect, useState } from "react";

export function LiveStatus() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());

    const intervalId = window.setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "Loading...";

  return (
    <div className="flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2">
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.8)]" />

      <div className="leading-none">
        <p className="text-xs font-bold text-emerald-300">Live simulation</p>

        <p className="mt-1 text-xs text-slate-400">
          Updated <span className="text-white">{formattedTime}</span>
        </p>
      </div>
    </div>
  );
}
