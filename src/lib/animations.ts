import type { Variants } from "motion/react";

const smoothEasing = [0.16, 1, 0.3, 1] as const; // --ease-out

export const pageVariants = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.26, ease: smoothEasing },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: 0.2, ease: smoothEasing },
  },
} satisfies Variants;
