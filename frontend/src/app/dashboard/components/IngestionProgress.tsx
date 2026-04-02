'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText,
    Image as ImageIcon,
    Type,
    Link as LinkIcon,
    Video,
    CheckCircle2,
    XCircle,
    Loader2,
    Clock4,
    Zap,
    AlertTriangle,
} from 'lucide-react';
import { api } from '../../../services/api';
import type { IngestionUpdate, IngestionSourceStatus } from '../../../services/api';

interface IngestionProgressProps {
    botId: string;
    batchId: string | null;
}

const SOURCE_ICONS: Record<string, React.ElementType> = {
    pdf: FileText,
    image: ImageIcon,
    long_text: Type,
    web_link: LinkIcon,
    video_link: Video,
};

const SOURCE_COLORS: Record<string, string> = {
    pdf: 'text-red-500',
    image: 'text-blue-500',
    long_text: 'text-green-500',
    web_link: 'text-purple-500',
    video_link: 'text-pink-500',
};

function SourceRow({ source }: { source: IngestionSourceStatus }) {
    const Icon = SOURCE_ICONS[source.type] ?? FileText;
    const colorClass = SOURCE_COLORS[source.type] ?? 'text-gray-500';

    const statusConfig = {
        pending: {
            icon: <Clock4 className="w-5 h-5 text-gray-400" />,
            label: 'Waiting',
            bg: 'bg-gray-50',
            border: 'border-gray-200',
        },
        processing: {
            icon: <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />,
            label: 'Processing…',
            bg: 'bg-orange-50',
            border: 'border-orange-200',
        },
        completed: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
            label: 'Done',
            bg: 'bg-emerald-50',
            border: 'border-emerald-200',
        },
        failed: {
            icon: <XCircle className="w-5 h-5 text-red-500" />,
            label: 'Failed',
            bg: 'bg-red-50',
            border: 'border-red-200',
        },
    }[source.status] ?? {
        icon: <Clock4 className="w-5 h-5 text-gray-400" />,
        label: source.status,
        bg: 'bg-gray-50',
        border: 'border-gray-200',
    };

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500 ${statusConfig.bg} ${statusConfig.border}`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${colorClass}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate font-medium" title={source.title}>{source.title}</p>
                <p className="text-xs text-gray-500 capitalize">
                    {source.type.replace('_', ' ')}
                </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                <span
                    className={`text-xs font-medium ${source.status === 'completed'
                        ? 'text-emerald-600'
                        : source.status === 'failed'
                            ? 'text-red-600'
                            : source.status === 'processing'
                                ? 'text-orange-600'
                                : 'text-gray-500'
                        }`}
                >
                    {statusConfig.label}
                </span>
                {statusConfig.icon}
            </div>
        </div>
    );
}

export function IngestionProgress({ botId, batchId }: IngestionProgressProps) {
    const router = useRouter();
    const cleanupRef = useRef<(() => void) | null>(null);

    const [update, setUpdate] = useState<IngestionUpdate | null>(null);
    const [wsError, setWsError] = useState<string | null>(null);
    const [isDone, setIsDone] = useState(false);
    const [countdown, setCountdown] = useState(4);
    const [startTime] = useState(Date.now());

    // ------------------------------------------------------------------
    // Case: No batch (user submitted bot without any data sources)
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!batchId) {
            setIsDone(true);
        }
    }, [batchId]);

    // ------------------------------------------------------------------
    // WebSocket connection
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!batchId) return;

        const cleanup = api.connectIngestionWebSocket(
            batchId,
            (data) => {
                setUpdate(data);
                setWsError(null);
            },
            (data) => {
                setUpdate(data);
                setIsDone(true);
            },
            (err) => {
                setWsError(err);
            }
        );

        cleanupRef.current = cleanup;
        return () => cleanup();
    }, [batchId]);

    // ------------------------------------------------------------------
    // Countdown redirect once done
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!isDone) return;
        const interval = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(interval);
                    router.push(`/dashboard/${botId}`);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isDone, botId, router]);

    // ------------------------------------------------------------------
    // Derived values
    // ------------------------------------------------------------------
    const total = update?.total_files ?? 0;
    const processed = update?.processed_files ?? 0;
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);

    const batchStatus = update?.status ?? 'pending';
    const hasFailed = batchStatus === 'failed';
    const rawErrorLog = update?.error_log ?? [];
    const isEmbedding = rawErrorLog.some((e: any) => e.note);
    const allErrors = rawErrorLog.filter((e: any) => !e.note);

    // Sub-step weighted progress (same logic as ingest page)
    const sourceStatuses: IngestionSourceStatus[] = update?.sources ?? [];
    const effectiveTotal = Math.max(total, sourceStatuses.length, 1);
    let weightedProgress = 0;
    for (const src of sourceStatuses) {
        if (src.status === 'completed' || src.status === 'failed') {
            weightedProgress += 1.0;
        } else if (src.status === 'processing') {
            weightedProgress += 0.5;
        }
    }
    if (isEmbedding && weightedProgress < effectiveTotal) {
        weightedProgress = Math.max(weightedProgress, effectiveTotal * 0.65);
    }
    const pct = batchStatus === 'completed'
        ? 100
        : Math.min(Math.round((weightedProgress / effectiveTotal) * 100), 99);

    // Estimated remaining time based on current throughput
    const estimatedSec =
        processed > 0 && total > processed
            ? Math.round((elapsedSec / processed) * (total - processed))
            : null;

    // Dynamic phase label
    let phaseLabel = 'Initializing pipeline...';
    if (batchStatus === 'completed') {
        phaseLabel = 'All sources embedded into knowledge base! ✅';
    } else if (batchStatus === 'failed') {
        phaseLabel = 'Some sources failed during processing.';
    } else if (isEmbedding) {
        phaseLabel = '🧠 Generating AI embeddings — this is the slowest step...';
    } else if (sourceStatuses.some(s => s.status === 'processing')) {
        const c = sourceStatuses.filter(s => s.status === 'processing').length;
        phaseLabel = `📄 Extracting & chunking ${c} document${c > 1 ? 's' : ''}...`;
    } else if (processed > 0 && processed < total) {
        phaseLabel = `💾 Storing vectors... ${processed}/${total} complete`;
    }

    // ------------------------------------------------------------------
    // Render: No data sources — simple success
    // ------------------------------------------------------------------
    if (!batchId) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center shadow-xl">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        Bot Created Successfully!
                    </h3>
                    <p className="text-gray-500 text-sm">No documents were uploaded. You can add knowledge later from the dashboard.</p>
                </div>
                <p className="text-sm text-gray-400">
                    Redirecting in <span className="font-semibold text-orange-500">{countdown}s</span>…
                </p>
                <button
                    onClick={() => router.push(`/dashboard/${botId}`)}
                    className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full hover:shadow-xl transition-all font-medium"
                >
                    Go to Dashboard →
                </button>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // Render: Completed success screen
    // ------------------------------------------------------------------
    if (isDone && !hasFailed) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
                {/* Animated success ring */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full animate-ping opacity-75" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full" />
                </div>

                <div className="text-center">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                        Your AI Persona is Ready! 🎉
                    </h3>
                    <p className="text-gray-500">
                        <span className="font-semibold text-emerald-600">{processed}</span> document
                        {processed !== 1 ? 's' : ''} indexed successfully
                    </p>
                </div>

                {/* Source summary */}
                {update?.sources && update.sources.length > 0 && (
                    <div className="w-full max-w-md space-y-2">
                        {update.sources.map((s) => (
                            <SourceRow key={s.id} source={s} />
                        ))}
                    </div>
                )}

                <div className="flex flex-col items-center gap-2">
                    <p className="text-sm text-gray-400">
                        Redirecting in{' '}
                        <span className="font-semibold text-orange-500">{countdown}s</span>…
                    </p>
                    <button
                        onClick={() => router.push(`/dashboard/${botId}`)}
                        className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full hover:shadow-xl transition-all font-medium"
                    >
                        Go to Dashboard →
                    </button>
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // Render: Failed screen
    // ------------------------------------------------------------------
    if (isDone && hasFailed) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-xl">
                    <XCircle className="w-10 h-10 text-white" />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ingestion Failed</h3>
                    <p className="text-gray-500 text-sm">
                        Your bot was created but document processing encountered errors.
                        You can retry from the dashboard.
                    </p>
                </div>

                {allErrors.length > 0 && (
                    <div className="w-full max-w-md space-y-2">
                        {allErrors.map((err, i) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm"
                            >
                                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    {err.title && <p className="font-medium text-gray-800">{err.title}</p>}
                                    <p className="text-red-600">{err.error}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => router.push(`/dashboard/${botId}`)}
                    className="px-8 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-full hover:shadow-xl transition-all font-medium"
                >
                    Go to Dashboard →
                </button>
            </div>
        );
    }

    // ------------------------------------------------------------------
    // Render: In-progress screen (main view)
    // ------------------------------------------------------------------
    const sources: IngestionSourceStatus[] = update?.sources ?? [];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                    {/* Spinning gradient ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-400 border-r-pink-500 animate-spin" />
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Zap className="w-7 h-7 text-white" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Training Your AI Persona…
                </h3>
                <p className="text-sm text-gray-500">
                    Please keep this tab open while your documents are being indexed.
                </p>
            </div>

            {/* Animated progress bar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">
                        {processed} of {total} file{total !== 1 ? 's' : ''} processed
                    </span>
                    <span className="font-semibold text-gray-900">{pct}%</span>
                </div>

                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                </div>

                {/* Dynamic phase label */}
                <p className="text-xs text-gray-500 font-medium">
                    {phaseLabel}
                </p>

                {estimatedSec !== null && (
                    <p className="text-xs text-gray-400 text-right">
                        ⚡ Estimated ~{estimatedSec}s remaining
                    </p>
                )}

                {/* WebSocket error banner */}
                {wsError && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>{wsError} — progress will resume automatically.</span>
                    </div>
                )}
            </div>

            {/* Per-file status list */}
            {sources.length > 0 ? (
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Documents
                    </h4>
                    <div 
                      className="overflow-y-auto pr-2 space-y-4 flex-1 styling-scrollbar min-h-0 overscroll-contain pb-4"
                      data-lenis-prevent
                   >
                        {sources.map((source) => (
                            <SourceRow key={source.id} source={source} />
                        ))}
                    </div>
                </div>
            ) : (
                // Skeleton placeholders while WS loads
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="h-14 bg-gray-100 rounded-xl animate-pulse"
                            style={{ opacity: 1 - i * 0.2 }}
                        />
                    ))}
                </div>
            )}

            {/* Bottom info */}
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-4 border border-orange-100 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
                <p className="text-sm text-gray-600">
                    Documents are being chunked, embedded, and stored in the knowledge base.
                    This usually takes <span className="font-semibold">30–90 seconds</span> per batch.
                </p>
            </div>
        </div>
    );
}
