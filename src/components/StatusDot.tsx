import { cn } from "../lib/utils";

interface StatusDotProps {
  connected: boolean;
  className?: string;
}

export function StatusDot({ connected, className }: StatusDotProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full transition-colors duration-300",
            connected ? "bg-green-400" : "bg-red-500"
          )}
        />
        {connected && (
          <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-green-400 animate-ping opacity-75" />
        )}
      </div>
      <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
        {connected ? "online" : "offline"}
      </span>
    </div>
  );
}
