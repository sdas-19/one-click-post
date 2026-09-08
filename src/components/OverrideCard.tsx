import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLATFORM_ICONS } from "@/lib/platforms";
import type { PlatformConfig, PlatformOverride } from "@/types";

interface OverrideCardProps {
  platform: PlatformConfig;
  override: PlatformOverride;
  globalCaption: string;
  onChange: (next: PlatformOverride) => void;
}

export function OverrideCard({
  platform,
  override,
  globalCaption,
  onChange,
}: OverrideCardProps) {
  const [open, setOpen] = useState(false);
  const Icon = PLATFORM_ICONS[platform.id];
  const hasCustom = platform.fields.some((f) => override[f].trim().length > 0);
  const isYouTube = platform.id === "youtube";

  const titleLabel = isYouTube ? "Video Title" : "Title";
  const captionLabel = isYouTube ? "Description" : "Caption";

  function reset() {
    onChange({ title: "", caption: "", hashtags: "" });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${platform.brand}14`, color: platform.brand }}
          >
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{platform.name}</span>
          {hasCustom && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              Customized
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform dark:text-gray-500",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-gray-100 px-4 py-4 dark:border-gray-800">
          {platform.fields.includes("title") && (
            <InputField
              label={titleLabel}
              placeholder={isYouTube ? "Add a video title…" : "Add a title…"}
              value={override.title}
              onChange={(v) => onChange({ ...override, title: v })}
            />
          )}

          <TextAreaField
            label={captionLabel}
            placeholder={globalCaption || "Write a caption…"}
            value={override.caption}
            onChange={(v) => onChange({ ...override, caption: v })}
          />

          {platform.fields.includes("hashtags") && (
            <TextAreaField
              label="Hashtags"
              placeholder="#hashtag #another"
              value={override.hashtags}
              onChange={(v) => onChange({ ...override, hashtags: v })}
            />
          )}

          {hasCustom && (
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <RotateCcw className="h-3 w-3" />
              Reset to global caption
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-500";

function InputField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
    </label>
  );
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className={cn("resize-none", fieldClass)}
      />
    </label>
  );
}
