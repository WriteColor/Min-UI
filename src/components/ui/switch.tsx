import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../lib/utils";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, label, description, ...props }, ref) => {
  if (label) {
    return (
      <div className="flex items-start justify-between gap-4 p-3 rounded-sm bg-black/30 border border-purple-500/10 hover:border-purple-500/20 transition-colors">
        <div className="space-y-0.5 flex-1">
          <label className="text-xs font-medium text-gray-200 cursor-pointer">
            {label}
          </label>
          {description && (
            <p className="text-[0.65rem] text-gray-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <SwitchPrimitive.Root
          ref={ref}
          className={cn(
            "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-purple-600 data-[state=checked]:shadow-md data-[state=checked]:shadow-purple-500/20",
            "data-[state=unchecked]:bg-zinc-800",
            className
          )}
          {...props}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150",
              "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5"
            )}
          />
        </SwitchPrimitive.Root>
      </div>
    );
  }

  return (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-purple-600 data-[state=checked]:shadow-md data-[state=checked]:shadow-purple-500/20",
        "data-[state=unchecked]:bg-zinc-800",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150",
          "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0.5"
        )}
      />
    </SwitchPrimitive.Root>
  );
});
Switch.displayName = "Switch";

export { Switch };
