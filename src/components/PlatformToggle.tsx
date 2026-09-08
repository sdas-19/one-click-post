import { cn } from "@/lib/utils";
import { PLATFORM_ICONS } from "@/lib/platforms";
import type { PlatformConfig } from "@/types";

interface PlatformToggleProps {
  platform: PlatformConfig;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}

export function PlatformToggle({
  platform,
  selected,
  disabled,
  onToggle,
}: PlatformToggleProps) {
  const Icon = PLATFORM_ICONS[platform.id];
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
        selected
          ? "border-gray-900 bg-gray-900 text-white dark:border-white dark:bg-white dark:text-gray-900"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600",
        disabled && "cursor-not-allowed opacity-40 hover:border-gray-200 dark:hover:border-gray-700",
      )}
    >
      <Icon className="h-4 w-4" />
      {platform.name}
    </button>
  );
}
