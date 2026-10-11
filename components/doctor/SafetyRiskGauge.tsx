"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, ShieldCheck, Zap, Thermometer, BatteryWarning } from "lucide-react";

interface SafetyRiskGaugeProps {
  level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  score: number; // 0 - 100
  hazards: string[];
}

export function SafetyRiskGauge({ level, score, hazards }: SafetyRiskGaugeProps) {
  const getLevelConfig = () => {
    switch (level) {
      case "CRITICAL":
        return {
          title: "CRITICAL RISK: ACTIVE ELECTRICAL / THERMAL HAZARD",
          color: "text-rose-400",
          bgColor: "bg-rose-950/40 border-rose-600/60",
          progressColor: "bg-gradient-to-r from-orange-500 via-rose-500 to-red-600",
          icon: ShieldAlert,
          actionNotice: "IMMEDIATELY DISCONNECT ALL POWER SOURCES. Do not connect to PC USB port until short circuit is resolved.",
        };
      case "HIGH":
        return {
          title: "HIGH RISK: POTENTIAL SILICON DAMAGE OR COMPONENT OVERHEATING",
          color: "text-amber-400",
          bgColor: "bg-amber-950/40 border-amber-600/50",
          progressColor: "bg-gradient-to-r from-yellow-500 to-amber-500",
          icon: AlertTriangle,
          actionNotice: "Power off circuit before modifying jumpers. Verify logic voltage compatibility (3.3V vs 5V).",
        };
      case "MEDIUM":
        return {
          title: "MODERATE RISK: LOGIC OR BUS COMMUNICATION MALFUNCTION",
          color: "text-yellow-400",
          bgColor: "bg-yellow-950/30 border-yellow-700/40",
          progressColor: "bg-yellow-500",
          icon: AlertTriangle,
          actionNotice: "Check pull-up resistor integrity, floating inputs, and common ground return paths.",
        };
      default:
        return {
          title: "LOW RISK: NOMINAL BENCH SAFETY",
          color: "text-emerald-400",
          bgColor: "bg-emerald-950/30 border-emerald-700/40",
          progressColor: "bg-emerald-500",
          icon: ShieldCheck,
          actionNotice: "Circuit voltages remain within normal low-voltage TTL/CMOS safety limits.",
        };
    }
  };

  const config = getLevelConfig();
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border ${config.bgColor} shadow-lg transition-all`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-black/40 border border-white/10 ${config.color}`}>
            <Icon className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold tracking-wider uppercase ${config.color}`}>
                Safety Risk Index: {level}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-zinc-300 border border-zinc-800">
                Score {score}/100
              </span>
            </div>
            <p className="text-xs font-semibold text-zinc-200 mt-0.5">{config.title}</p>
          </div>
        </div>

        {/* Hazard Metrics Badges */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/50 border border-zinc-800 text-zinc-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Logic: {level === "CRITICAL" ? "High Risk" : "Monitored"}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-black/50 border border-zinc-800 text-zinc-300">
            <Thermometer className="w-3.5 h-3.5 text-rose-400" />
            <span>Thermal: {score > 70 ? "Elevated" : "Normal"}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-black/60 overflow-hidden border border-zinc-800">
          <div
            className={`h-full ${config.progressColor} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, Math.max(8, score))}%` }}
          />
        </div>
      </div>

      {/* Immediate Action Checklist */}
      <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="text-zinc-300 leading-tight">
          <span className="font-bold text-white">Action Protocol: </span>
          {config.actionNotice}
        </div>
        {hazards.length > 0 && (
          <span className="text-[11px] font-mono text-zinc-400 shrink-0">
            {hazards.length} flagged risk factor{hazards.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
