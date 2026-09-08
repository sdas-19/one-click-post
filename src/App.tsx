import { useEffect, useState } from "react";
import { Menu, X, Sun, Moon } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { AccountsView } from "@/components/AccountsView";
import { CreateView } from "@/components/CreateView";
import { HistoryView } from "@/components/HistoryView";
import { DEFAULT_ACCOUNTS } from "@/lib/platforms";
import { useTheme } from "@/lib/useTheme";
import { checkYouTubeConnected, disconnectYouTube } from "@/lib/youtube";
import { checkInstagramConnected, disconnectInstagram } from "@/lib/instagram";
import type { PlatformId, PlatformMap, ViewId } from "@/types";

type AlertType = { type: "success" | "error"; message: string };

export default function App() {
  const { theme, toggle } = useTheme();
  const [view, setView] = useState<ViewId>("create");
  const [accounts, setAccounts] = useState<PlatformMap>(DEFAULT_ACCOUNTS);
  const [selected, setSelected] = useState<Set<PlatformId>>(new Set());
  const [mobileNav, setMobileNav] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [alert, setAlert] = useState<AlertType | null>(null);

  // Check connections on mount + handle OAuth redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ytConnected = params.get("yt_connected");
    const ytError = params.get("yt_error");
    const igConnected = params.get("ig_connected");
    const igError = params.get("ig_error");

    if (ytConnected === "true") {
      setAlert({ type: "success", message: "YouTube connected successfully!" });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (ytError) {
      setAlert({ type: "error", message: `YouTube connection failed: ${ytError}` });
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (igConnected === "true") {
      setAlert({ type: "success", message: "Instagram connected successfully!" });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (igError) {
      setAlert({ type: "error", message: `Instagram connection failed: ${igError}` });
      window.history.replaceState({}, "", window.location.pathname);
    }

    (async () => {
      const [ytConnected, igConnected] = await Promise.all([
        checkYouTubeConnected(),
        checkInstagramConnected(),
      ]);
      setAccounts((prev) => ({
        ...prev,
        youtube: ytConnected
          ? { connected: true, handle: "YouTube Channel" }
          : prev.youtube,
        instagram: igConnected
          ? { connected: true, handle: "Instagram Business Account" }
          : prev.instagram,
      }));
    })();
  }, []);

  const connectedCount = Object.values(accounts).filter(
    (a) => a.connected,
  ).length;

  function handleConnect(id: PlatformId, handle: string) {
    if (handle.length === 0) {
      if (id === "youtube") {
        disconnectYouTube().then(() => {
          setAccounts((prev) => ({
            ...prev,
            youtube: { connected: false, handle: "" },
          }));
        });
      } else if (id === "instagram") {
        disconnectInstagram().then(() => {
          setAccounts((prev) => ({
            ...prev,
            instagram: { connected: false, handle: "" },
          }));
        });
      } else {
        setAccounts((prev) => ({
          ...prev,
          [id]: { connected: false, handle: "" },
        }));
      }
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    setAccounts((prev) => ({
      ...prev,
      [id]: { connected: true, handle },
    }));
  }

  function toggleSelected(id: PlatformId) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function changeView(v: ViewId) {
    setView(v);
    setMobileNav(false);
  }

  function refreshHistory() {
    setHistoryKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden dark:border-gray-800 dark:bg-gray-900">
        <span className="text-sm font-semibold">Broadcast</span>
        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} onToggle={toggle} />
          <button
            onClick={() => setMobileNav((m) => !m)}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar — desktop */}
        <div className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
          <Sidebar
            view={view}
            onView={changeView}
            connectedCount={connectedCount}
          />
        </div>

        {/* Sidebar — mobile drawer */}
        {mobileNav && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => setMobileNav(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64">
              <Sidebar
                view={view}
                onView={changeView}
                connectedCount={connectedCount}
              />
            </div>
          </div>
        )}

        {/* Main */}
        <main className="min-h-screen flex-1 px-4 py-6 sm:px-8 lg:py-8">
          {/* Desktop header bar */}
          <div className="mb-6 hidden items-center justify-end lg:flex">
            <ThemeToggle theme={theme} onToggle={toggle} />
          </div>

          {/* OAuth alert */}
          {alert && (
            <div
              className={
                alert.type === "success"
                  ? "mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                  : "mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
              }
            >
              <div className="flex items-center justify-between">
                <span>{alert.message}</span>
                <button
                  onClick={() => setAlert(null)}
                  className="ml-3 text-xs opacity-60 hover:opacity-100"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {view === "create" ? (
            <CreateView
              accounts={accounts}
              selected={selected}
              onToggle={toggleSelected}
              onPublished={refreshHistory}
            />
          ) : view === "accounts" ? (
            <AccountsView accounts={accounts} onConnect={handleConnect} />
          ) : (
            <HistoryView key={historyKey} />
          )}
        </main>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      aria-label="Toggle dark mode"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
