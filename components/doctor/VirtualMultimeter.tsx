"use client";

import React, { useState } from "react";
import { Zap, Volume2, ShieldCheck, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface VirtualMultimeterProps {
  hypotheses: Array<{
    id: string;
    title: string;
    recommendedTest: string;
    expectedResult: string;
  }>;
  onRecordResult: (faultId: string, outcome: "Passed" | "Failed" | "Inconclusive", readingNotes?: string) => void;
  className?: string;
}

export function VirtualMultimeter({
  hypotheses,
  onRecordResult,
  className = "",
}: VirtualMultimeterProps) {
  const [mode, setMode] = useState<"resistance" | "voltage" | "continuity">("resistance");
  const [selectedHypothesisId, setSelectedHypothesisId] = useState<string>(
    hypotheses[0]?.id || ""
  );
  const [measuredValue, setMeasuredValue] = useState<string>("");
  const [evaluationFeedback, setEvaluationFeedback] = useState<{
    status: "pass" | "fail" | "idle";
    message: string;
  }>({ status: "idle", message: "" });

  const activeHypothesis = hypotheses.find((h) => h.id === selectedHypothesisId) || hypotheses[0];

  // Synthesize continuity buzzer sound using browser Web Audio API
  const playContinuityTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch (_) {}
  };

  const handleEvaluate = () => {
    if (!measuredValue.trim() || !activeHypothesis) return;
    const num = parseFloat(measuredValue);
    if (isNaN(num)) {
      setEvaluationFeedback({ status: "idle", message: "Please enter a valid numeric probe reading." });
      return;
    }

    const expected = (activeHypothesis.expectedResult || "").toLowerCase();

    if (mode === "continuity" || (mode === "resistance" && num < 5)) {
      playContinuityTone();
    }

    let isPassing = false;
    let feedback = "";

    if (expected.includes(">") || expected.includes("mega") || expected.includes("open") || expected.includes("100k")) {
      // Expecting high resistance / open circuit
      if (num < 10) {
        // Measured dead short!
        isPassing = false;
        feedback = `Short Circuit Detected! ${num}Ω measured (expected > 100kΩ). Fault hypothesis confirmed!`;
      } else {
        isPassing = true;
        feedback = `Nominal open rail resistance: ${num}kΩ. Rail is safely isolated.`;
      }
    } else if (expected.includes("3.3") || expected.includes("5.0") || expected.includes("nominal") || expected.includes("v")) {
      // Voltage test
      if (Math.abs(num - 3.3) < 0.3 || Math.abs(num - 5.0) < 0.4) {
        isPassing = true;
        feedback = `Voltage rail nominal: ${num}V matches reference.`;
      } else {
        isPassing = false;
        feedback = `Voltage sag/drop detected: ${num}V is outside expected operating rail.`;
      }
    } else {
      isPassing = num > 0;
      feedback = `Probe reading recorded: ${num} ${mode === "voltage" ? "V" : "Ω"}.`;
    }

    setEvaluationFeedback({
      status: isPassing ? "pass" : "fail",
      message: feedback,
    });

    onRecordResult(
      activeHypothesis.id,
      isPassing ? "Passed" : "Failed",
      `Measured ${measuredValue} ${mode === "voltage" ? "V" : "Ω"} (${feedback})`
    );
  };

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-[#0c1019] p-4 text-zinc-100 shadow-2xl font-sans ${className}`}
    >
      {/* Multimeter Header & Brand */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="h-3.5 w-3.5" />
          </span>
          <div>
            <h3 className="font-mono text-xs font-bold text-zinc-100 flex items-center gap-1.5">
              <span>FLUKE-87V Pro Virtual Multimeter</span>
              <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1 text-[9px]">
                CALIBRATED
              </span>
            </h3>
            <p className="text-[10px] font-mono text-zinc-500">True-RMS Hardware Diagnostic Probe</p>
          </div>
        </div>

        {/* Rotary Dial Mode Selectors */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => {
              setMode("resistance");
              setEvaluationFeedback({ status: "idle", message: "" });
            }}
            className={`px-2 py-0.5 rounded transition-all ${
              mode === "resistance"
                ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Ω Resistance
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("voltage");
              setEvaluationFeedback({ status: "idle", message: "" });
            }}
            className={`px-2 py-0.5 rounded transition-all ${
              mode === "voltage"
                ? "bg-sky-500 text-zinc-950 font-bold shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            V DC Volts
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("continuity");
              setEvaluationFeedback({ status: "idle", message: "" });
            }}
            className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
              mode === "continuity"
                ? "bg-emerald-500 text-zinc-950 font-bold shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Volume2 className="h-2.5 w-2.5" />
            <span>Beep 🔊</span>
          </button>
        </div>
      </div>

      {/* Main LCD Display Readout */}
      <div className="mt-3 rounded-lg border border-zinc-800/80 bg-[#06080e] p-3 shadow-inner flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block">
            {mode === "resistance" ? "Resistance Test Range [0 - 40 MΩ]" : mode === "voltage" ? "DC Voltage Range [0 - 1000 V]" : "Audio Continuity Threshold [< 10 Ω]"}
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-mono text-2xl font-bold tracking-tight text-emerald-400">
              {measuredValue ? measuredValue : "0.00"}
            </span>
            <span className="font-mono text-sm font-semibold text-zinc-400">
              {mode === "voltage" ? "VDC" : "Ω"}
            </span>
          </div>
        </div>

        <div className="text-right font-mono text-[10px] text-zinc-500 space-y-0.5">
          <div className="flex items-center justify-end gap-1 text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            <span>CAT IV 600V</span>
          </div>
          <div>6000 Counts</div>
          <div className="text-zinc-600">Sample Rate: 4/sec</div>
        </div>
      </div>

      {/* Probe Input & Target Hypothesis Selector */}
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs font-mono">
        {/* Target Hypothesis Select */}
        <div className="sm:col-span-7">
          <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
            Target Test Point:
          </label>
          <select
            value={selectedHypothesisId}
            onChange={(e) => {
              setSelectedHypothesisId(e.target.value);
              setEvaluationFeedback({ status: "idle", message: "" });
            }}
            className="w-full rounded bg-zinc-900 border border-zinc-700/80 px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            {hypotheses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>
        </div>

        {/* Input Value */}
        <div className="sm:col-span-5 flex items-end gap-1.5">
          <div className="flex-1">
            <label className="text-[10px] text-zinc-400 uppercase tracking-wider block mb-1">
              Probe Reading:
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={measuredValue}
                onChange={(e) => setMeasuredValue(e.target.value)}
                placeholder="e.g. 0.2 or 3.3"
                className="w-full rounded bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 text-xs text-zinc-100 font-mono focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-2 top-1 text-[11px] text-zinc-500">
                {mode === "voltage" ? "V" : "Ω"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEvaluate}
            className="flex items-center gap-1 rounded bg-amber-500 hover:bg-amber-400 px-3 py-1.5 text-xs font-bold text-zinc-950 shadow-xs transition-colors shrink-0"
            title="Evaluate probe reading against expected hardware threshold"
          >
            <span>Probe</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Target Reference & Threshold helper */}
      {activeHypothesis && (
        <div className="mt-2.5 rounded bg-zinc-900/60 border border-zinc-800/60 p-2 font-mono text-[11px] space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-zinc-500">Test Procedure:</span>
            <span className="text-sky-400 truncate max-w-[260px]" title={activeHypothesis.recommendedTest}>
              {activeHypothesis.recommendedTest}
            </span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-500">Expected Value:</span>
            <span className="text-emerald-400 font-semibold">{activeHypothesis.expectedResult}</span>
          </div>
        </div>
      )}

      {/* Evaluation Feedback Message */}
      {evaluationFeedback.message && (
        <div
          className={`mt-2.5 flex items-center gap-2 rounded-lg p-2.5 font-mono text-xs border ${
            evaluationFeedback.status === "pass"
              ? "bg-emerald-950/30 border-emerald-700/60 text-emerald-300"
              : evaluationFeedback.status === "fail"
              ? "bg-rose-950/30 border-rose-700/60 text-rose-300"
              : "bg-zinc-900 border-zinc-800 text-zinc-300"
          }`}
        >
          {evaluationFeedback.status === "pass" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          ) : evaluationFeedback.status === "fail" ? (
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <Zap className="h-4 w-4 text-amber-400 shrink-0" />
          )}
          <span className="flex-1">{evaluationFeedback.message}</span>
        </div>
      )}
    </div>
  );
}
