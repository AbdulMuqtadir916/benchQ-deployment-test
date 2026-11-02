"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentRunStatus } from "./agent-run-panel";

/**
 * useAgentRun — the heavy-AI theatre engine. Steps through named stages with
 * variable 2–5s total latency and a 5% fallback-to-manual, per
 * docs/03-MOCK-DATA.md §5. No LLM call; the timing is the point of the UX.
 */
export function useAgentRun(stageCount: number, opts?: { fallbackRate?: number }) {
  const fallbackRate = opts?.fallbackRate ?? 0.05;
  const [activeStage, setActiveStage] = useState(0);
  const [status, setStatus] = useState<AgentRunStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedAt = useRef(0);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (tick.current) clearInterval(tick.current);
    tick.current = null;
  }, []);

  const start = useCallback(() => {
    clearAll();
    setStatus("running");
    setActiveStage(0);
    setElapsedMs(0);
    startedAt.current = Date.now();
    tick.current = setInterval(() => setElapsedMs(Date.now() - startedAt.current), 100);

    const willFallback = Math.random() < fallbackRate;
    const stageDurations = Array.from({ length: stageCount }, () => 500 + Math.random() * 900);
    let acc = 0;
    stageDurations.forEach((d, i) => {
      acc += d;
      timers.current.push(
        setTimeout(() => {
          if (i < stageCount - 1) setActiveStage(i + 1);
          else {
            clearAll();
            setStatus(willFallback ? "fallback" : "complete");
          }
        }, acc),
      );
    });
  }, [clearAll, fallbackRate, stageCount]);

  const reset = useCallback(() => {
    clearAll();
    setStatus("idle");
    setActiveStage(0);
    setElapsedMs(0);
  }, [clearAll]);

  useEffect(() => clearAll, [clearAll]);

  return { activeStage, status, elapsedMs, start, reset };
}
