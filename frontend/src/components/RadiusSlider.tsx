import * as React from "react";
import { Radius } from "lucide-react";
import { cn } from "@/lib/utils";

export function RadiusSlider({
  value,
  onChange,
  min = 1,
  max = 50,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  className?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm",
        className
      )}
    >
      <Radius className="h-4 w-4 shrink-0 text-brand-accent" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-700">Search radius</span>
          <span className="font-semibold text-brand">{value} km</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="mt-1 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-accent [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-accent"
          style={{
            background: `linear-gradient(to right, #F47B20 0%, #F47B20 ${pct}%, #e2e8f0 ${pct}%, #e2e8f0 100%)`,
          }}
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>{min} km</span>
          <span>{max} km</span>
        </div>
      </div>
    </div>
  );
}
