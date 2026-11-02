"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/cn";
import { SPRING_PRESS } from "@/lib/motion";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  isIndeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, isIndeterminate = false, checked, defaultChecked, onChange, disabled, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(Boolean(defaultChecked));
    const reduceMotion = useReducedMotion() ?? false;
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? Boolean(checked) : uncontrolledChecked;

    React.useImperativeHandle(forwardedRef, () => innerRef.current!);
    React.useEffect(() => {
      if (innerRef.current) innerRef.current.indeterminate = isIndeterminate;
    }, [isIndeterminate]);

    return (
      <span className={cn("relative inline-flex h-4 w-4 shrink-0", disabled && "opacity-45", className)}>
        <input
          ref={innerRef}
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={(event) => {
            if (!isControlled) setUncontrolledChecked(event.target.checked);
            onChange?.(event);
          }}
          className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        <span
          aria-hidden="true"
          data-checked={isChecked || isIndeterminate}
          className="inline-flex h-4 w-4 items-center justify-center rounded-[var(--radius-xs)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-white shadow-[var(--shadow-xs)] transition-[background,border-color] duration-[var(--duration-fast)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-focus-ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--color-surface)] data-[checked=true]:border-[var(--color-primary)] data-[checked=true]:bg-[var(--color-primary)]"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {isIndeterminate || isChecked ? (
              <motion.span
                key={isIndeterminate ? "minus" : "check"}
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.55 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.7 }}
                transition={reduceMotion ? { duration: 0.1 } : SPRING_PRESS}
                className="inline-flex"
              >
                {isIndeterminate ? <Minus size={11} strokeWidth={2.5} /> : <Check size={11} strokeWidth={2.5} />}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </span>
    );
  },
);
Checkbox.displayName = "Checkbox";
