import { useState } from "react";
import { Check, Loader2, Plug, Unplug } from "lucide-react";
import { PLATFORM_ICONS, PLATFORMS, type PlatformIcon } from "@/lib/platforms";
import { StatusBadge } from "@/components/StatusBadge";
import { startYouTubeAuth } from "@/lib/youtube";
import { startInstagramAuth } from "@/lib/instagram";
import type { PlatformId, PlatformMap } from "@/types";

interface AccountsViewProps {
  accounts: PlatformMap;
  onConnect: (id: keyof PlatformMap, handle: string) => void;
}

export function AccountsView({ accounts, onConnect }: AccountsViewProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          Connected Accounts
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Link your social profiles to publish across them in one click.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map((p) => {
          const Icon = PLATFORM_ICONS[p.id];
          const acc = accounts[p.id];
          return (
            <AccountCard
              key={p.id}
              platformId={p.id}
              name={p.name}
              handleLabel={p.handleLabel}
              brand={p.brand}
              Icon={Icon}
              connected={acc.connected}
              handle={acc.handle}
              onConnect={(handle) => onConnect(p.id, handle)}
              onDisconnect={() => onConnect(p.id, "")}
            />
          );
        })}
      </div>
    </div>
  );
}

interface AccountCardProps {
  platformId: PlatformId;
  name: string;
  handleLabel: string;
  brand: string;
  Icon: PlatformIcon;
  connected: boolean;
  handle: string;
  onConnect: (handle: string) => void;
  onDisconnect: () => void;
}

function AccountCard({
  platformId,
  name,
  handleLabel,
  brand,
  Icon,
  connected,
  handle,
  onConnect,
  onDisconnect,
}: AccountCardProps) {
  const [connecting, setConnecting] = useState(false);
  const [draftHandle, setDraftHandle] = useState("");
  const [error, setError] = useState("");

  const isYouTube = platformId === "youtube";
  const isInstagram = platformId === "instagram";
  const usesOAuth = isYouTube || isInstagram;

  async function handleOAuthConnect() {
    setConnecting(true);
    setError("");
    try {
      if (isYouTube) await startYouTubeAuth();
      else if (isInstagram) await startInstagramAuth();
    } catch (err) {
      setError((err as Error).message);
      setConnecting(false);
    }
  }

  function handleConnect() {
    setConnecting(true);
    window.setTimeout(() => {
      setConnecting(false);
      onConnect(draftHandle.trim() || `@${name.toLowerCase()}_user`);
      setDraftHandle("");
    }, 900);
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${brand}14`, color: brand }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {connected ? handle : `No ${handleLabel} linked`}
            </p>
          </div>
        </div>
        <StatusBadge status={connected ? "connected" : "disconnected"} />
      </div>

      <div className="mt-4">
        {connected ? (
          <button
            onClick={onDisconnect}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Unplug className="h-4 w-4" />
            Disconnect
          </button>
        ) : usesOAuth ? (
          <div>
            <button
              onClick={handleOAuthConnect}
              disabled={connecting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plug className="h-4 w-4" />
              )}
              {connecting ? "Opening Meta…" : isYouTube ? "Connect with Google" : "Connect with Meta"}
            </button>
            {connecting && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Redirecting to {isYouTube ? "Google" : "Meta"} OAuth consent screen…
              </p>
            )}
            {error && (
              <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>
            )}
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                value={draftHandle}
                onChange={(e) => setDraftHandle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                placeholder={`${handleLabel} name`}
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-500"
              />
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plug className="h-4 w-4" />
                )}
                {connecting ? "Linking" : "Connect"}
              </button>
            </div>
            {connecting && (
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Authorizing with {name}…
              </p>
            )}
          </div>
        )}
      </div>

      {connected && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5" />
          Ready to publish
        </div>
      )}
    </div>
  );
}
