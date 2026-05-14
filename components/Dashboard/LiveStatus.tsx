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
    <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

        <p className="text-sm font-semibold text-emerald-300">
          Live simulation
        </p>
      </div>

      <p className="mt-2 text-sm text-slate-300">
        Last updated{" "}
        <span className="font-semibold text-white">{formattedTime}</span>
      </p>

      <p className="mt-1 text-xs text-slate-400">
        Mock mood signals refresh visually every 30 seconds.
      </p>
    </div>
  );
}
