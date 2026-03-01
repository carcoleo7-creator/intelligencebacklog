import { cn } from "@/lib/utils";

export function ScoreMeter({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600"
      : score >= 60
      ? "text-yellow-600"
      : score >= 40
      ? "text-orange-500"
      : "text-red-500";

  return (
    <div className="flex flex-col items-center shrink-0 min-w-[44px]">
      <span className={cn("text-lg font-bold tabular-nums", color)}>{score}</span>
      <span className="text-[10px] text-gray-400 leading-none">/ 100</span>
    </div>
  );
}
