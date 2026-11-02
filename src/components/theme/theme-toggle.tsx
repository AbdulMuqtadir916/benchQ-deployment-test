"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => {
    finished: Promise<void>;
  };
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion() ?? false;
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  const isDark = mounted ? resolvedTheme === "dark" : false;
  const label = !mounted
    ? "Toggle theme"
    : isDark
      ? "Switch to light theme"
      : "Switch to dark theme";

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = isDark ? "light" : "dark";
    const viewTransitionDocument = document as ViewTransitionDocument;

    if (reduceMotion || !viewTransitionDocument.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    const button = event.currentTarget;
    const bounds = button.getBoundingClientRect();
    const originX = bounds.left + bounds.width / 2;
    const originY = bounds.top + bounds.height / 2;
    const root = document.documentElement;

    root.style.setProperty("--bq-theme-origin", `${originX}px ${originY}px`);
    root.dataset.themeTransition = "circle-blur";

    const transition = viewTransitionDocument.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.finished.finally(() => {
      delete root.dataset.themeTransition;
      root.style.removeProperty("--bq-theme-origin");
    });
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className="group relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--gradient-neutral)] text-[var(--color-text-2)] shadow-[var(--shadow-control)] transition-[background,border-color,color,transform] duration-[var(--duration-fast)] hover:border-[var(--color-text-3)] hover:bg-[var(--gradient-neutral-hover)] hover:text-[var(--color-text)] active:scale-[0.96]"
    >
      {mounted ? (
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={isDark ? "sun" : "moon"}
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.72, rotate: -18, filter: "blur(5px)" }}
            animate={{ opacity: 1, scale: 1, rotate: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.72, rotate: 18, filter: "blur(5px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </motion.span>
        </AnimatePresence>
      ) : (
        <span className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
