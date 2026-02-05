"use client";

import { useEffect, useMemo, useState } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {
  useCurrentAccount,
  useCurrentClient,
  useDAppKit,
  useWalletConnection,
} from "@mysten/dapp-kit-react";
import type { ContentItem } from "../lib/content";
import { appConfig, isChainConfigured } from "../lib/config";
import { parseSuiToMist } from "../lib/sui";

type Props = {
  item: ContentItem;
  initialDeposit?: number;
};

const formatAmount = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });

const CLOCK_OBJECT_ID = "0x6";

const ZERO_BIGINT = BigInt(0);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseBalance = (balanceField: unknown) => {
  if (!balanceField) return ZERO_BIGINT;
  const fields =
    isRecord(balanceField) && isRecord(balanceField.fields)
      ? balanceField.fields
      : isRecord(balanceField)
      ? balanceField
      : null;
  const raw = fields && "value" in fields ? fields.value : 0;
  try {
    return BigInt(String(raw ?? 0));
  } catch {
    return ZERO_BIGINT;
  }
};

const parseBigInt = (value: unknown) => {
  try {
    return BigInt(String(value ?? 0));
  } catch {
    return ZERO_BIGINT;
  }
};

type HistoryEntry = {
  id: string;
  title: string;
  mode: "demo" | "chain";
  durationSec: number;
  spentSui: string;
  refundSui: string;
  endedAt: string;
};

export default function ReaderClient({ item, initialDeposit }: Props) {
  const account = useCurrentAccount();
  const connection = useWalletConnection();
  const dappKit = useDAppKit();
  const client = useCurrentClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chainBalance, setChainBalance] = useState<bigint>(ZERO_BIGINT);
  const [chainSpent, setChainSpent] = useState<bigint>(ZERO_BIGINT);
  const [chainStatus, setChainStatus] = useState<number | null>(null);
  const [chainStreamedMs, setChainStreamedMs] = useState(0);
  const [chainLastCheckpointMs, setChainLastCheckpointMs] = useState<number | null>(
    null
  );
  const [, setChainTick] = useState(0);
  const [chainLoading, setChainLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStartLocalMs, setSessionStartLocalMs] = useState<number | null>(null);

  const costPerSecond = useMemo(() => item.ratePer10sSui / 10, [item.ratePer10sSui]);
  const [deposit, setDeposit] = useState(
    initialDeposit && Number.isFinite(initialDeposit)
      ? initialDeposit
      : item.depositOptions[0]
  );
  const [running, setRunning] = useState(false);
  const [spent, setSpent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState(0.05);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const normalizeId = (value: unknown) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (isRecord(value)) {
      if (typeof value.id === "string") return value.id;
      if (typeof value.bytes === "string") return value.bytes;
    }
    return String(value);
  };

  const normalizeObjectId = (value: unknown) => {
    const raw = normalizeId(value);
    if (!raw) return "";
    if (raw.startsWith("0x")) return raw;
    if (raw.length === 64) return `0x${raw}`;
    return raw;
  };

  useEffect(() => {
    if (initialDeposit && Number.isFinite(initialDeposit)) {
      setDeposit(initialDeposit);
    } else {
      setDeposit(item.depositOptions[0]);
    }
  }, [initialDeposit, item.id]);

  useEffect(() => {
    setSessionId(null);
    setChainBalance(ZERO_BIGINT);
    setChainSpent(ZERO_BIGINT);
    setChainStatus(null);
    setChainStreamedMs(0);
    setChainLastCheckpointMs(null);
    setSessionStarted(false);
    setSessionStartLocalMs(null);
  }, [account?.address, item.objectId]);

  const chainReady =
    isChainConfigured &&
    Boolean(item.objectId) &&
    Boolean(item.vaultId) &&
    connection.isConnected &&
    Boolean(account);

  const refreshSession = async (id = sessionId) => {
    if (!id || !client) return;
    const result = await client.core.getObject({
      objectId: id,
      include: { json: true },
    });
    const fields = result.object?.json ?? {};
    setChainBalance(parseBalance(fields.deposit_balance));
    setChainSpent(parseBigInt(fields.total_spent));
    setChainStatus(Number(fields.status ?? 0));
    setChainStreamedMs(Number(fields.total_streamed_ms ?? 0));
    const checkpointMs =
      fields.last_checkpoint_ms !== undefined
        ? Number(fields.last_checkpoint_ms)
        : null;
    setChainLastCheckpointMs(
      checkpointMs && Number.isFinite(checkpointMs) ? checkpointMs : null
    );
    if (Number(fields.status ?? 0) !== 1) {
      setSessionStarted(false);
    }
  };

  const findLatestSession = async () => {
    if (!client || !account) return null;
    const type = `${appConfig.packageId}::${appConfig.moduleName}::Session`;
    const owned = await client.core.listOwnedObjects({
      owner: account.address,
      type,
      include: { json: true },
    });
    const matches = owned.objects
      .map((entry) => ({
        id: entry.objectId,
        fields: entry.json ?? {},
      }))
      .filter((entry) => entry.id && entry.fields)
      .filter((entry) => {
        const contentId = normalizeObjectId(entry.fields?.content_id);
        return contentId && item.objectId && contentId === item.objectId;
      })
      .filter((entry) => {
        const status = Number(entry.fields?.status ?? 0);
        return status === 1 || status === 2;
      })
      .sort((a, b) => {
        const aStart = Number(a.fields?.start_time_ms ?? 0);
        const bStart = Number(b.fields?.start_time_ms ?? 0);
        return bStart - aStart;
      });
    return matches[0] ?? null;
  };

  useEffect(() => {
    if (!chainReady || !sessionId) return;
    const interval = setInterval(() => {
      refreshSession();
    }, 10000);
    return () => clearInterval(interval);
  }, [chainReady, sessionId]);

  useEffect(() => {
    if (!chainReady || sessionId || sessionStarted) return;
    let cancelled = false;
    (async () => {
      const latest = await findLatestSession();
      if (cancelled || !latest?.id) return;
      setSessionId(latest.id);
      await refreshSession(latest.id);
    })();
    return () => {
      cancelled = true;
    };
  }, [chainReady, sessionId, item.objectId]);

  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
      setDeposit((prev) => {
        const next = Math.max(prev - costPerSecond, 0);
        return Number(next.toFixed(6));
      });
      setSpent((prev) => Number((prev + costPerSecond).toFixed(6)));
    }, 1000);

    return () => clearInterval(timer);
  }, [running, costPerSecond]);

  useEffect(() => {
    if (deposit <= 0 && running) {
      setRunning(false);
    }
  }, [deposit, running]);

  const demoStatus = deposit <= 0 ? "Paused" : running ? "Active" : "Idle";
  const chainIsActive = chainStatus === 1 || sessionStarted;
  const chainSnapshotReady =
    chainStatus !== null || chainBalance > ZERO_BIGINT || chainSpent > ZERO_BIGINT;
  const useLocalFallback =
    sessionStartLocalMs !== null &&
    chainIsActive &&
    chainBalance === ZERO_BIGINT &&
    chainSpent === ZERO_BIGINT;
  const chainBalanceSui = Number(chainBalance) / 1_000_000_000;
  const chainSpentSui = Number(chainSpent) / 1_000_000_000;
  const baseBalanceSui =
    useLocalFallback
      ? deposit
      : chainBalance > ZERO_BIGINT || chainSnapshotReady
      ? chainBalanceSui
      : deposit;
  const checkpointMs =
    chainLastCheckpointMs ??
    (!chainSnapshotReady || useLocalFallback ? sessionStartLocalMs : null);
  const chainElapsedSinceCheckpointMs = checkpointMs
    ? Math.max(Date.now() - checkpointMs, 0)
    : 0;
  const ratePerMs = item.ratePer10sSui / 10_000;
  const maxExtraMs =
    ratePerMs > 0 ? Math.floor(baseBalanceSui / ratePerMs) : 0;
  const effectiveExtraMs = chainIsActive
    ? Math.min(chainElapsedSinceCheckpointMs, maxExtraMs)
    : 0;
  const chainLiveElapsedMs = chainStreamedMs + effectiveExtraMs;
  const chainLiveSpentSui = chainSpentSui + effectiveExtraMs * ratePerMs;
  const chainLiveRemainingSui = Math.max(
    baseBalanceSui - effectiveExtraMs * ratePerMs,
    0
  );
  const chainDepleted = chainIsActive && chainLiveRemainingSui <= 0;

  const chainStatusLabel =
    chainStatus === 3
      ? "Ended"
      : chainStatus === 1 && chainDepleted
      ? "Paused"
      : chainStatus === 1
      ? "Active"
      : chainStatus === 2
      ? "Paused"
      : "Idle";

  const displayElapsedMs = chainLiveElapsedMs;
  const displaySpentSui = chainLiveSpentSui;
  const displayRemainingSui = chainLiveRemainingSui;

  const lowBalanceThreshold = item.ratePer10sSui * 3;
  const isLowBalanceDemo = deposit > 0 && deposit <= lowBalanceThreshold;
  const isLowBalanceChain =
    chainLiveRemainingSui > 0 && chainLiveRemainingSui <= lowBalanceThreshold;

  useEffect(() => {
    if (!chainReady || !chainIsActive || chainDepleted) {
      return;
    }
    const timer = setInterval(() => {
      setChainTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [chainReady, chainIsActive, chainDepleted, setChainTick]);

  const handleTopUp = () => {
    if (topUpAmount <= 0) {
      return;
    }
    setDeposit((prev) => Number((prev + topUpAmount).toFixed(6)));
  };

  const handleStartChain = async () => {
    if (!chainReady) return;
    setChainLoading(true);
    try {
      const amountMist = parseSuiToMist(deposit);
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist)]);
      tx.moveCall({
        target: `${appConfig.packageId}::${appConfig.moduleName}::start_session`,
        arguments: [
          tx.object(item.objectId!),
          tx.object(item.vaultId!),
          coin,
          tx.object(CLOCK_OBJECT_ID),
        ],
      });

      const result = await dappKit.signAndExecuteTransaction({
        transaction: tx,
      });

      let createdSessionId: string | null = null;
      if (client) {
        const txResult =
          result.$kind === "Transaction" ? result.Transaction : result.FailedTransaction;
        const createdIds =
          txResult.effects?.changedObjects
            ?.filter((change) => change.idOperation === "Created")
            .map((change) => change.objectId) ?? [];
        if (createdIds.length > 0) {
          const expectedPrefix = `${appConfig.packageId}::${appConfig.moduleName}::Session`;
          for (const objectId of createdIds) {
            try {
              const createdObj = await client.core.getObject({ objectId });
              const objectType = createdObj.object?.type ?? "";
              if (objectType.startsWith(expectedPrefix)) {
                createdSessionId = objectId;
                break;
              }
            } catch {}
          }
        }
      }

      if (createdSessionId) {
        setSessionId(createdSessionId);
        setSessionStarted(true);
        setChainStatus(1);
        setChainBalance(amountMist);
        setChainSpent(ZERO_BIGINT);
        setChainStreamedMs(0);
        setChainLastCheckpointMs(Date.now());
        setSessionStartLocalMs(Date.now());
        await refreshSession(createdSessionId);
      } else {
        const latest = await findLatestSession();
        if (latest?.id) {
          setSessionId(latest.id);
          setSessionStarted(true);
          setChainStatus(1);
          setChainBalance(amountMist);
          setChainSpent(ZERO_BIGINT);
          setChainStreamedMs(0);
          setChainLastCheckpointMs(Date.now());
          setSessionStartLocalMs(Date.now());
          await refreshSession(latest.id);
        }
      }
    } catch {
      setSessionStarted(false);
      setChainStatus(null);
      setChainBalance(ZERO_BIGINT);
      setChainSpent(ZERO_BIGINT);
      setChainStreamedMs(0);
      setChainLastCheckpointMs(null);
      setSessionStartLocalMs(null);
    } finally {
      setChainLoading(false);
    }
  };

  const handleCheckpoint = async () => {
    if (!chainReady || !sessionId) return;
    setChainLoading(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${appConfig.packageId}::${appConfig.moduleName}::checkpoint`,
        arguments: [
          tx.object(sessionId),
          tx.object(item.vaultId!),
          tx.object(CLOCK_OBJECT_ID),
        ],
      });
      await dappKit.signAndExecuteTransaction({
        transaction: tx,
      });
      await refreshSession();
    } finally {
      setChainLoading(false);
    }
  };

  const handleTopUpChain = async () => {
    if (!chainReady || !sessionId) return;
    setChainLoading(true);
    try {
      const amountMist = parseSuiToMist(topUpAmount);
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(amountMist)]);
      tx.moveCall({
        target: `${appConfig.packageId}::${appConfig.moduleName}::top_up`,
        arguments: [
          tx.object(sessionId),
          coin,
          tx.object(CLOCK_OBJECT_ID),
        ],
      });
      await dappKit.signAndExecuteTransaction({
        transaction: tx,
      });
      await refreshSession();
    } finally {
      setChainLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!chainReady) return;
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const latest = await findLatestSession();
      if (latest?.id) {
        activeSessionId = latest.id;
        setSessionId(latest.id);
        await refreshSession(latest.id);
      }
    }
    if (!activeSessionId) return;
    setChainLoading(true);
    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${appConfig.packageId}::${appConfig.moduleName}::end_session`,
        arguments: [
          tx.object(activeSessionId),
          tx.object(item.vaultId!),
          tx.object(CLOCK_OBJECT_ID),
        ],
      });
      await dappKit.signAndExecuteTransaction({
        transaction: tx,
      });
      await refreshSession();
      setHistory((prev) => [
        {
          id: activeSessionId,
          title: item.title,
          mode: "chain",
          durationSec: Math.floor(displayElapsedMs / 1000),
          spentSui: displaySpentSui.toFixed(4),
          refundSui: displayRemainingSui.toFixed(4),
          endedAt: new Date().toLocaleString(),
        },
        ...prev,
      ]);
      setSessionStarted(false);
      setSessionStartLocalMs(null);
    } finally {
      setChainLoading(false);
    }
  };

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  const chainMinutes = Math.floor(displayElapsedMs / 1000 / 60);
  const chainSeconds = Math.floor(displayElapsedMs / 1000) % 60;

  const chainHasFunds = displayRemainingSui > 0;
  const showPaywall = chainReady ? !(chainIsActive && chainHasFunds) : !running;
  const isDepositEmpty = chainReady ? displayRemainingSui <= 0 : deposit <= 0;
  const paywallTitle = isDepositEmpty ? "Deposit habis" : "Start reading";
  const paywallBody = isDepositEmpty
    ? "Top up deposit untuk lanjut membaca."
    : "Klik Start Reading untuk memulai sesi.";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#e6ddd3] bg-white p-5 shadow-[0_30px_60px_-45px_rgba(10,20,24,0.6)]">
        <div className="flex items-center justify-between text-sm text-[#6b6763]">
          <span>{item.title}</span>
          <span className="rounded-full border border-[#e6ddd3] px-3 py-1 text-xs uppercase tracking-[0.2em]">
            {chainReady ? chainStatusLabel : demoStatus}
          </span>
        </div>
        <div className="relative">
          <iframe
            src={`${item.pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="h-[70vh] w-full rounded-2xl border border-[#efe7de]"
            title={`Reader ${item.title}`}
          />
          {showPaywall && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#efe7de] bg-white/85 text-center backdrop-blur">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6b6763]">
                  Premium Access
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#0b2430]">
                  {paywallTitle}
                </h3>
                <p className="mt-1 text-sm text-[#6b6763]">{paywallBody}</p>
              </div>
              {chainReady ? (
                <button
                  onClick={handleStartChain}
                  disabled={chainLoading || deposit <= 0}
                  className="rounded-full bg-[#0b6b52] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  Start on-chain
                </button>
              ) : (
                <button
                  onClick={() => setRunning(true)}
                  disabled={deposit <= 0}
                  className="rounded-full bg-[#0b6b52] px-6 py-3 text-sm font-semibold text-white"
                >
                  Start reading
                </button>
              )}
            </div>
          )}
        </div>
      </div>
        <div className="flex flex-col gap-6 rounded-3xl border border-[#e6ddd3] bg-white p-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[#6b6763]">
            Stream Status
          </span>
          <div className="text-2xl font-semibold text-[#0b2430]">
            {chainReady
              ? `${chainMinutes}:${chainSeconds.toString().padStart(2, "0")}`
              : `${minutes}:${seconds.toString().padStart(2, "0")}`}
          </div>
          <p className="text-sm text-[#6b6763]">
            Cost rate: {formatAmount(item.ratePer10sSui)} SUI / 10s
          </p>
        </div>

        <div className="grid gap-4 rounded-2xl border border-[#efe7de] bg-[#faf7f2] p-4 text-sm text-[#0b0f1a]">
          <div className="flex items-center justify-between">
            <span>Deposit remaining</span>
            <span className="font-semibold">
              {chainReady
                ? `${formatAmount(displayRemainingSui)} SUI`
                : `${formatAmount(deposit)} SUI`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Total spent</span>
            <span className="font-semibold">
              {chainReady
                ? `${formatAmount(displaySpentSui)} SUI`
                : `${formatAmount(spent)} SUI`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Creator earned</span>
            <span className="font-semibold">
              {chainReady
                ? `${formatAmount(displaySpentSui)} SUI`
                : `${formatAmount(spent)} SUI`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Checkpoint interval</span>
            <span className="font-semibold">10s</span>
          </div>
        </div>
        {chainReady && (
          <div className="rounded-2xl border border-[#efe7de] bg-white px-4 py-3 text-xs text-[#6b6763]">
            Escrow mode: deposit is held while reading. On <span className="font-semibold">End</span>,
            spent amount is paid directly to the creator wallet{" "}
            <span className="font-semibold text-[#0b2430]">{item.creator}</span>,
            and remaining balance is refunded to your wallet.
          </div>
        )}

        {(isLowBalanceDemo || isLowBalanceChain) && (
          <div className="rounded-2xl border border-[#f1c6c3] bg-[#fdeeee] px-4 py-3 text-xs text-[#a0211d]">
            Deposit hampir habis, top up untuk lanjut membaca.
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {item.depositOptions.map((option) => (
              <button
                key={option}
                onClick={() => setDeposit(option)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  deposit === option
                    ? "border-[#0b6b52] bg-[#0b6b52] text-white"
                    : "border-[#e6ddd3] bg-white text-[#0b2430]"
                }`}
              >
                {option} SUI
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {!chainReady ? (
              <>
                <button
                  onClick={() => setRunning((prev) => !prev)}
                  className="flex-1 rounded-full bg-[#0b2430] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b6b52]"
                >
                  {running ? "Pause session" : "Start session"}
                </button>
                <button
                  onClick={() => {
                    const refund = deposit;
                    const spentValue = spent;
                    const duration = elapsed;
                    setRunning(false);
                    setElapsed(0);
                    setSpent(0);
                    setHistory((prev) => [
                      {
                        id: `demo-${Date.now()}`,
                        title: item.title,
                        mode: "demo",
                        durationSec: duration,
                        spentSui: spentValue.toFixed(4),
                        refundSui: refund.toFixed(4),
                        endedAt: new Date().toLocaleString(),
                      },
                      ...prev,
                    ]);
                  }}
                  className="rounded-full border border-[#e6ddd3] px-5 py-3 text-sm font-semibold text-[#0b2430]"
                >
                  Reset
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartChain}
                  disabled={chainLoading || chainIsActive}
                  className="flex-1 rounded-full bg-[#0b2430] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b6b52] disabled:opacity-60"
                >
                  Start on-chain
                </button>
                <button
                  onClick={handleCheckpoint}
                  disabled={!sessionId || chainLoading || !chainIsActive}
                  className="rounded-full border border-[#0b2430] px-5 py-3 text-sm font-semibold text-[#0b2430] disabled:opacity-60"
                >
                  Checkpoint
                </button>
                <button
                  onClick={handleEndSession}
                  disabled={chainLoading || !chainIsActive}
                  className="rounded-full border border-[#e6ddd3] px-5 py-3 text-sm font-semibold text-[#0b2430] disabled:opacity-60"
                >
                  End
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[#efe7de] pt-4">
          <span className="text-xs uppercase tracking-[0.2em] text-[#6b6763]">
            Top up
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={topUpAmount}
              onChange={(event) => setTopUpAmount(Number(event.target.value))}
              className="w-full rounded-full border border-[#e6ddd3] bg-white px-4 py-2 text-sm"
            />
            <button
              onClick={chainReady ? handleTopUpChain : handleTopUp}
              disabled={chainReady && (!sessionId || chainLoading)}
              className="rounded-full border border-[#0b2430] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0b2430] disabled:opacity-60"
            >
              Add
            </button>
          </div>
          {chainReady ? (
            <p className="text-xs text-[#6b6763]">
              On-chain mode active. You will be prompted to sign each action.
            </p>
          ) : (
            <p className="text-xs text-[#6b6763]">
              Demo mode. Connect wallet and configure on-chain IDs to go live.
            </p>
          )}
        </div>

        {history.length > 0 && (
          <div className="rounded-3xl border border-[#efe7de] bg-white p-4 text-sm text-[#6b6763]">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-[#6b6763]">
              Receipt & History
            </div>
            <div className="grid gap-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-[#efe7de] bg-[#faf7f2] p-3"
                >
                  <div className="flex items-center justify-between text-xs text-[#6b6763]">
                    <span>{entry.mode.toUpperCase()}</span>
                    <span>{entry.endedAt}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[#0b2430]">
                    {entry.title}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span>Duration</span>
                    <span>{Math.floor(entry.durationSec / 60)}m {entry.durationSec % 60}s</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span>Total paid</span>
                    <span>{entry.spentSui} SUI</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span>Refund</span>
                    <span>{entry.refundSui} SUI</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
