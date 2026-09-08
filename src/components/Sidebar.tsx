import { LayoutGrid, PlusCircle, Sparkles, History } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewId } from "@/types";

interface SidebarProps {
  view: ViewId;
  onView: (v: ViewId) => void;
  connectedCount: number;
}

const NAV: { id: ViewId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "create", label: "Create Post", icon: PlusCircle },
  { id: "accounts", label: "Accounts", icon: LayoutGrid },
  { id: "history", label: "Post History", icon: History },
];

export function Sidebar({ view, onView, connectedCount }: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900">
          <Sparkles className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Broadcast</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Social autoposter</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 px-3">
        <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Menu
        </p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = view === item.id;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onView(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                  )}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="m-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Connected accounts</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {connectedCount}
          <span className="text-sm font-normal text-gray-400 dark:text-gray-500"> / 5</span>
        </p>
      </div>
    </aside>
  );
}
