"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Terminal,
  Activity,
  Send,
  Trash2,
  Copy,
  Download,
  Lock,
  Unlock,
  Clock,
  X,
  Maximize2,
  Minimize2,
  Check,
} from "lucide-react";

export interface SerialLogEntry {
  id: string;
  timestamp: string;
  tag: "BOOT" | "POWER" | "SENSOR" | "ACTUATOR" | "IMU" | "BUS" | "WARN" | "CMD" | "INFO";
  text: string;
  raw: string;
}

export interface TelemetryPoint {
  time: number;
  sensor: number; // 0 - 100
  temp: number; // -10 - 60
  pot: number; // 0 - 100
}

interface SerialMonitorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SerialLogEntry[];
  onClearLogs: () => void;
  onSendCommand: (command: string) => void;
  baudRate: number;
  onBaudRateChange: (rate: number) => void;
  telemetryHistory: TelemetryPoint[];
  isSimulating: boolean;
}

export function SerialMonitorDrawer({
  isOpen,
  onClose,
  logs,
  onClearLogs,
  onSendCommand,
  baudRate,
  onBaudRateChange,
  telemetryHistory,
  isSimulating,
}: SerialMonitorDrawerProps) {
  const [activeTab, setActiveTab] = useState<"terminal" | "plotter">("terminal");
  const [filterTag, setFilterTag] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [showTimestamps, setShowTimestamps] = useState<boolean>(true);
  const [heightMode, setHeightMode] = useState<"compact" | "normal" | "tall">("normal");
  const [commandInput, setCommandInput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [rxBlink, setRxBlink] = useState<boolean>(false);
  const [txBlink, setTxBlink] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when logs update
  useEffect(() => {
    if (autoScroll && activeTab === "terminal") {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll, activeTab]);

  // RX activity light blink on new log
  useEffect(() => {
    if (logs.length > 0) {
      const startTimer = setTimeout(() => {
        setRxBlink(true);
      }, 0);
      const endTimer = setTimeout(() => {
        setRxBlink(false);
      }, 120);
      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
  }, [logs.length]);

  const handleSend = () => {
    const trimmed = commandInput.trim();
    if (!trimmed) return;
    setTxBlink(true);
    setTimeout(() => setTxBlink(false), 150);
    onSendCommand(trimmed);
    setCommandInput("");
  };

  const handleCopyLogs = async () => {
    const text = logs.map((l) => l.raw).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFile = () => {
    const text = logs.map((l) => l.raw).join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `serial_monitor_${baudRate}_${Date.now()}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = useMemo(() => {
    if (filterTag === "ALL") return logs;
    return logs.filter((l) => l.tag === filterTag);
  }, [logs, filterTag]);

  if (!isOpen) return null;

  const heightClasses = {
    compact: "h-48",
    normal: "h-72",
    tall: "h-96",
  }[heightMode];

  const getTagColor = (tag: string) => {
    switch (tag) {
      case "BOOT":
      case "POWER":
        return "text-sky-400";
      case "SENSOR":
        return "text-cyan-400";
      case "ACTUATOR":
        return "text-emerald-400";
      case "IMU":
        return "text-indigo-400";
      case "BUS":
        return "text-purple-400";
      case "WARN":
        return "text-amber-400";
      case "CMD":
        return "text-fuchsia-400";
      default:
        return "text-zinc-400";
    }
  };

  // SVG Plotter geometry
  const plotterWidth = 700;
  const plotterHeight = 150;
  const maxPoints = 35;
  const recentTelemetry = telemetryHistory.slice(-maxPoints);

  const getPointsString = (key: "sensor" | "temp" | "pot", min: number, max: number) => {
    if (recentTelemetry.length < 2) return "";
    const stepX = plotterWidth / (maxPoints - 1);
    const startOffset = maxPoints - recentTelemetry.length;

    return recentTelemetry
      .map((p, idx) => {
        const x = (startOffset + idx) * stepX;
        const normalized = Math.max(0, Math.min(1, (p[key] - min) / (max - min)));
        const y = plotterHeight - normalized * (plotterHeight - 16) - 8;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const sensorPolyline = getPointsString("sensor", 0, 100);
  const tempPolyline = getPointsString("temp", 0, 60);
  const potPolyline = getPointsString("pot", 0, 100);

  const latestTelemetry = telemetryHistory[telemetryHistory.length - 1] || {
    sensor: 0,
    temp: 24,
    pot: 50,
  };

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className={`absolute bottom-3 left-3 ${
        isSimulating ? "right-3 md:right-[274px]" : "right-3"
      } z-30 rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col font-mono text-xs transition-all duration-200 ${heightClasses}`}
    >
      {/* Top Header & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-900/90 px-3.5 py-2 border-b border-zinc-800 text-zinc-300">
        {/* Left: Title + Status Indicators */}
        <div className="flex items-center gap-2.5">
          <Terminal className="h-4 w-4 text-cyan-400" />
          <span className="font-bold text-xs text-zinc-100 flex items-center gap-2">
            Serial Studio
            <span className="hidden sm:inline text-[10px] text-zinc-400 font-normal">
              (COM3 • USB UART)
            </span>
          </span>

          {/* RX / TX Activity LEDs */}
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-[9px]">
            <span className="flex items-center gap-1 font-bold text-zinc-400">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  rxBlink ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-zinc-600"
                }`}
              />
              RX
            </span>
            <span className="flex items-center gap-1 font-bold text-zinc-400">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  txBlink ? "bg-amber-400 shadow-[0_0_6px_#fbbf24]" : "bg-zinc-600"
                }`}
              />
              TX
            </span>
          </div>

          {/* Baud Rate Selector */}
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded-md border border-zinc-700/60">
            <span>Baud:</span>
            <select
              value={baudRate}
              onChange={(e) => onBaudRateChange(Number(e.target.value))}
              className="bg-transparent text-cyan-300 focus:outline-hidden font-bold cursor-pointer"
            >
              <option value={9600} className="bg-zinc-900 text-zinc-200">9600</option>
              <option value={19200} className="bg-zinc-900 text-zinc-200">19200</option>
              <option value={38400} className="bg-zinc-900 text-zinc-200">38400</option>
              <option value={57600} className="bg-zinc-900 text-zinc-200">57600</option>
              <option value={115200} className="bg-zinc-900 text-zinc-200">115200</option>
              <option value={230400} className="bg-zinc-900 text-zinc-200">230400</option>
            </select>
          </div>
        </div>

        {/* Center: Terminal vs Plotter Tabs */}
        <div className="flex items-center gap-1 bg-zinc-800/70 p-0.5 rounded-lg border border-zinc-700/60 text-[11px]">
          <button
            onClick={() => setActiveTab("terminal")}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeTab === "terminal"
                ? "bg-cyan-600 text-white font-bold shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Terminal className="h-3 w-3" />
            <span>Terminal</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-black/30 opacity-80">
              {logs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("plotter")}
            className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
              activeTab === "plotter"
                ? "bg-cyan-600 text-white font-bold shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Activity className="h-3 w-3" />
            <span>Plotter (Waveform)</span>
          </button>
        </div>

        {/* Right: Tools & Window Controls */}
        <div className="flex items-center gap-1.5">
          {/* Autoscroll */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 ${
              autoScroll ? "text-cyan-400" : ""
            }`}
            title={autoScroll ? "Auto-scroll ON (click to pause)" : "Auto-scroll PAUSED"}
          >
            {autoScroll ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          </button>

          {/* Timestamps */}
          <button
            onClick={() => setShowTimestamps(!showTimestamps)}
            className={`p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 ${
              showTimestamps ? "text-cyan-400" : ""
            }`}
            title="Toggle Timestamps"
          >
            <Clock className="h-3.5 w-3.5" />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopyLogs}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Export */}
          <button
            onClick={handleExportFile}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Download log file"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Clear */}
          <button
            onClick={onClearLogs}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-rose-400"
            title="Clear all logs"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Height Resize Toggle */}
          <button
            onClick={() => {
              if (heightMode === "compact") setHeightMode("normal");
              else if (heightMode === "normal") setHeightMode("tall");
              else setHeightMode("compact");
            }}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            title="Resize Drawer Height"
          >
            {heightMode === "tall" ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 transition-colors ml-1"
            title="Close Serial Monitor"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter Category Chips (Only in Terminal tab) */}
      {activeTab === "terminal" && (
        <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900/60 border-b border-zinc-800/80 text-[10px] overflow-x-auto">
          <span className="text-zinc-500 font-semibold uppercase text-[9px]">Filter:</span>
          {["ALL", "SENSOR", "ACTUATOR", "WARN", "CMD", "BOOT"].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-2 py-0.5 rounded-full transition-colors font-medium ${
                filterTag === tag
                  ? "bg-zinc-700 text-zinc-100 font-bold"
                  : "bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Main Terminal View */}
      {activeTab === "terminal" && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-[11px] leading-snug selection:bg-cyan-900 selection:text-white">
          {filteredLogs.length === 0 ? (
            <div className="text-zinc-600 italic py-4 text-center">
              No logs received yet. Click &apos;Run Simulation&apos; to begin receiving serial packets.
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={`${log.id}-${idx}`} className="flex items-start gap-2 hover:bg-zinc-900/40 rounded px-1 -mx-1">
                {showTimestamps && (
                  <span className="text-zinc-600 select-none shrink-0 font-mono text-[10px]">
                    [{log.timestamp}]
                  </span>
                )}
                <span className={`font-bold select-none shrink-0 ${getTagColor(log.tag)}`}>
                  [{log.tag}]
                </span>
                <span className="text-zinc-300 break-all">{log.text}</span>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      )}

      {/* Serial Plotter View */}
      {activeTab === "plotter" && (
        <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden bg-zinc-950">
          {/* Telemetry Legend Bar */}
          <div className="flex items-center justify-between text-[11px] pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                <span className="text-zinc-400">Sensor:</span>
                <strong className="text-cyan-400 font-mono">{latestTelemetry.sensor}%</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="text-zinc-400">Temperature:</span>
                <strong className="text-amber-400 font-mono">{latestTelemetry.temp}°C</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-zinc-400">Wiper ADC:</span>
                <strong className="text-emerald-400 font-mono">{latestTelemetry.pot}%</strong>
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">
              Live Window: Last {maxPoints} ticks
            </span>
          </div>

          {/* SVG Line Graph */}
          <div className="flex-1 relative w-full h-full flex items-center justify-center my-2">
            <svg
              viewBox={`0 0 ${plotterWidth} ${plotterHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              {/* Horizontal Gridlines */}
              {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  y1={plotterHeight * ratio}
                  x2={plotterWidth}
                  y2={plotterHeight * ratio}
                  stroke="#27272a"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Data Lines */}
              {sensorPolyline && (
                <polyline
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sensorPolyline}
                />
              )}
              {tempPolyline && (
                <polyline
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={tempPolyline}
                />
              )}
              {potPolyline && (
                <polyline
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={potPolyline}
                />
              )}
            </svg>
          </div>

          <div className="flex justify-between text-[9px] text-zinc-500 font-mono pt-1 border-t border-zinc-800">
            <span>0% / Min</span>
            <span>25%</span>
            <span>50%</span>
            <span>75%</span>
            <span>100% / Max Scale</span>
          </div>
        </div>
      )}

      {/* Interactive TX Command Bar */}
      <div className="bg-zinc-900/90 border-t border-zinc-800 p-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold select-none">&gt;</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Send command to virtual MCU (e.g. HELP, LED ON, STATUS, READ)..."
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-hidden focus:border-cyan-500 font-mono"
          />
          <button
            onClick={handleSend}
            disabled={!commandInput.trim()}
            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors font-sans"
          >
            <Send className="h-3 w-3" />
            <span>Send</span>
          </button>
        </div>

        {/* Quick Command Chips */}
        <div className="flex items-center gap-1.5 text-[10px] overflow-x-auto text-zinc-400">
          <span className="text-[9px] uppercase font-bold text-zinc-500 shrink-0">Quick Cmds:</span>
          {["STATUS", "READ SENSORS", "LED ON", "LED OFF", "RELAY ON", "RELAY OFF", "HELP"].map(
            (cmd) => (
              <button
                key={cmd}
                onClick={() => onSendCommand(cmd)}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono hover:text-white transition-colors shrink-0"
              >
                {cmd}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
