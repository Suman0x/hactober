"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Activity,
  Flame,
  Thermometer,
  Droplets,
  Eye,
  Radio,
  Gauge,
  Bell,
  Sun,
  Compass,
  Sparkles,
} from "lucide-react";

export interface VirtualSensorValues {
  soilMoisture: number; // 0 - 100 %
  temperature: number; // -10 - 60 °C
  humidity: number; // 10 - 95 %
  distanceCm: number; // 2 - 400 cm
  lightLux: number; // 0 - 1000 Lux
  potentiometerVal: number; // 0 - 1023
  gasPpm: number; // 50 - 1000 PPM
  isButtonPressed: boolean;
  isSwitchLatching: boolean;
  isMotionTriggered: boolean;
  isAutoFluctuate: boolean;
}

interface VirtualSensorsPanelProps {
  isSimulating: boolean;
  values: VirtualSensorValues;
  onChange: (updater: (prev: VirtualSensorValues) => VirtualSensorValues) => void;
  activeComponentTypes: string[];
}

export function VirtualSensorsPanel({
  isSimulating,
  values,
  onChange,
  activeComponentTypes,
}: VirtualSensorsPanelProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<"detected" | "all">("detected");
  const [motionCountdown, setMotionCountdown] = useState<number | null>(null);

  // Auto-fluctuate physics drift effect
  useEffect(() => {
    if (!isSimulating || !values.isAutoFluctuate) return;

    const interval = setInterval(() => {
      onChange((prev) => {
        const drift = (Math.random() - 0.5) * 1.5;
        return {
          ...prev,
          soilMoisture: Math.min(100, Math.max(0, Math.round(prev.soilMoisture + drift))),
          temperature: Math.min(60, Math.max(-10, +(prev.temperature + drift * 0.2).toFixed(1))),
          lightLux: Math.min(1000, Math.max(0, Math.round(prev.lightLux + drift * 3))),
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, values.isAutoFluctuate, onChange]);

  // Motion sensor pulse countdown
  useEffect(() => {
    if (motionCountdown === null) return;
    if (motionCountdown <= 0) {
      const resetTimer = setTimeout(() => {
        setMotionCountdown(null);
        onChange((prev) => ({ ...prev, isMotionTriggered: false }));
      }, 0);
      return () => clearTimeout(resetTimer);
    }
    const timer = setTimeout(() => {
      setMotionCountdown((c) => (c ? c - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [motionCountdown, onChange]);

  const handleTriggerMotion = () => {
    onChange((prev) => ({ ...prev, isMotionTriggered: true }));
    setMotionCountdown(3);
  };

  // Keyboard shortcut: Spacebar holds/releases button when focused or during sim
  useEffect(() => {
    if (!isSimulating) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        onChange((prev) => ({ ...prev, isButtonPressed: true }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        onChange((prev) => ({ ...prev, isButtonPressed: false }));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSimulating, onChange]);

  // Check detected sensors on canvas
  const hasSoil = activeComponentTypes.some((t) => t.includes("soil"));
  const hasDht = activeComponentTypes.some((t) => t.includes("dht"));
  const hasBmp = activeComponentTypes.some((t) => t.includes("bmp"));
  const hasUltrasonic = activeComponentTypes.some((t) => t.includes("ultrasonic"));
  const hasLdr = activeComponentTypes.some((t) => t.includes("ldr"));
  const hasPot = activeComponentTypes.some((t) => t.includes("potentiometer"));
  const hasGas = activeComponentTypes.some((t) => t.includes("gas") || t.includes("mq2"));
  const hasPir = activeComponentTypes.some((t) => t.includes("pir"));
  const hasButton = activeComponentTypes.some((t) => t.includes("button") || t.includes("switch"));

  const detectedCount = [hasSoil, hasDht || hasBmp, hasUltrasonic, hasLdr, hasPot, hasGas, hasPir, hasButton].filter(Boolean).length;

  // Preset scenarios
  const applyPreset = (preset: "drought" | "flood" | "gas_alarm" | "intruder" | "night" | "normal") => {
    onChange((prev) => {
      switch (preset) {
        case "drought":
          return { ...prev, soilMoisture: 12, temperature: 37, humidity: 22 };
        case "flood":
          return { ...prev, soilMoisture: 92, humidity: 95, temperature: 21 };
        case "gas_alarm":
          return { ...prev, gasPpm: 820, temperature: 42 };
        case "intruder":
          return { ...prev, distanceCm: 18, isMotionTriggered: true };
        case "night":
          return { ...prev, lightLux: 10, temperature: 18 };
        case "normal":
          return {
            ...prev,
            soilMoisture: 55,
            temperature: 24.5,
            humidity: 50,
            distanceCm: 120,
            lightLux: 450,
            potentiometerVal: 512,
            gasPpm: 120,
            isButtonPressed: false,
            isSwitchLatching: false,
            isMotionTriggered: false,
          };
      }
    });
  };

  const resetAll = () => applyPreset("normal");

  if (!isSimulating) {
    return null;
  }

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="absolute top-4 right-4 z-20 w-64 max-h-[calc(100vh-140px)] sm:max-h-[calc(100%-2rem)] flex flex-col rounded-2xl border border-zinc-200/90 bg-white/95 shadow-2xl backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-900/95 font-sans overflow-hidden transition-all duration-200"
    >
      {/* Header Bar */}
      <div className="shrink-0 flex items-center justify-between border-b border-zinc-200/80 px-2.5 py-2 bg-zinc-50/80 dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-ping" />
          <div className="flex items-center gap-1 min-w-0">
            <Sliders className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
              Virtual Sensors
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={resetAll}
            title="Reset All Inputs to Nominal"
            className="rounded p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand Panel" : "Minimize Panel"}
            className="rounded p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            {isMinimized ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Minimized Quick Summary Bar */}
      {isMinimized && (
        <div className="shrink-0 px-2.5 py-1.5 flex items-center justify-between text-[10px] font-mono text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50">
          <span>Soil: <strong className="text-emerald-600">{values.soilMoisture}%</strong></span>
          <span>Temp: <strong className="text-amber-600">{values.temperature}°C</strong></span>
          <span>Dist: <strong className="text-cyan-600">{values.distanceCm}cm</strong></span>
        </div>
      )}

      {/* Expanded Content - Scrollable & Compact */}
      {!isMinimized && (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2.5 pb-5 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300 [scrollbar-width:thin] [scrollbar-color:rgba(156,163,175,0.5)_transparent]">
          {/* Quick Scenario Testing Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              <span className="flex items-center gap-1 text-[9px]">
                <Sparkles className="h-3 w-3 text-amber-500" /> Scenarios
              </span>
              <button
                onClick={() =>
                  onChange((prev) => ({ ...prev, isAutoFluctuate: !prev.isAutoFluctuate }))
                }
                className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-mono transition-colors ${
                  values.isAutoFluctuate
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-bold"
                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:text-zinc-700"
                }`}
                title="Simulates real-world sensor noise and environmental fluctuation"
              >
                <Activity className="h-2.5 w-2.5" /> Drift: {values.isAutoFluctuate ? "ON" : "OFF"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[9px]">
              <button
                onClick={() => applyPreset("drought")}
                className="px-1 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300 font-medium transition-colors text-center"
              >
                🌵 Dry
              </button>
              <button
                onClick={() => applyPreset("flood")}
                className="px-1 py-1 rounded bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 text-cyan-800 dark:bg-cyan-950/40 dark:border-cyan-800/60 dark:text-cyan-300 font-medium transition-colors text-center"
              >
                💧 Wet
              </button>
              <button
                onClick={() => applyPreset("gas_alarm")}
                className="px-1 py-1 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-300 font-medium transition-colors text-center"
              >
                🚨 Gas
              </button>
              <button
                onClick={() => applyPreset("intruder")}
                className="px-1 py-1 rounded bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-800/60 dark:text-indigo-300 font-medium transition-colors text-center"
              >
                🏃 Motion
              </button>
              <button
                onClick={() => applyPreset("night")}
                className="px-1 py-1 rounded bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 dark:bg-purple-950/40 dark:border-purple-800/60 dark:text-purple-300 font-medium transition-colors text-center"
              >
                🌙 Night
              </button>
              <button
                onClick={() => applyPreset("normal")}
                className="px-1 py-1 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 font-medium transition-colors text-center"
              >
                🟢 Reset
              </button>
            </div>
          </div>

          {/* Tab Selector: Filter to Canvas Sensors vs All */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-[10px]">
            <button
              onClick={() => setActiveTab("detected")}
              className={`pb-1 px-1 font-medium border-b-2 transition-all ${
                activeTab === "detected"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-bold"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              Canvas {detectedCount > 0 && `(${detectedCount})`}
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-1 px-2 font-medium border-b-2 transition-all ${
                activeTab === "all"
                  ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 font-bold"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              All Controls
            </button>
          </div>

          {/* 1. Soil Moisture Control */}
          {(activeTab === "all" || hasSoil || detectedCount === 0) && (
            <div className="space-y-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                  <Droplets className="h-3 w-3 text-emerald-500" /> Soil Moisture
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {values.soilMoisture}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={values.soilMoisture}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onChange((prev) => ({ ...prev, soilMoisture: val }));
                }}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-emerald-600"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-400 pt-0.5">
                <button
                  onClick={() => onChange((prev) => ({ ...prev, soilMoisture: 15 }))}
                  className="hover:text-amber-600"
                >
                  Dry (15%)
                </button>
                <button
                  onClick={() => onChange((prev) => ({ ...prev, soilMoisture: 55 }))}
                  className="hover:text-emerald-600 font-bold"
                >
                  Optimal (55%)
                </button>
                <button
                  onClick={() => onChange((prev) => ({ ...prev, soilMoisture: 90 }))}
                  className="hover:text-cyan-600"
                >
                  Wet (90%)
                </button>
              </div>
            </div>
          )}

          {/* 2. Temperature & Humidity (DHT22 / BMP280) */}
          {(activeTab === "all" || hasDht || hasBmp || detectedCount === 0) && (
            <div className="space-y-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                    <Thermometer className="h-3 w-3 text-rose-500" /> Temperature
                  </span>
                  <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                    {values.temperature}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="60"
                  step="0.5"
                  value={values.temperature}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onChange((prev) => ({ ...prev, temperature: val }));
                  }}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-rose-500"
                />
                <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                  <span>-10°C (Cold)</span>
                  <span>25°C (Room)</span>
                  <span>60°C (Hot)</span>
                </div>
              </div>

              <div className="space-y-1 pt-1.5 border-t border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                    <Droplets className="h-3 w-3 text-sky-500" /> Rel. Humidity
                  </span>
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                    {values.humidity}% RH
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={values.humidity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onChange((prev) => ({ ...prev, humidity: val }));
                  }}
                  className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-sky-500"
                />
              </div>
            </div>
          )}

          {/* 3. Ultrasonic Distance (HC-SR04) */}
          {(activeTab === "all" || hasUltrasonic) && (
            <div className="space-y-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                  <Radio className="h-3 w-3 text-cyan-500" /> Ultrasonic Distance
                </span>
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {values.distanceCm} cm
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="400"
                value={values.distanceCm}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onChange((prev) => ({ ...prev, distanceCm: val }));
                }}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-cyan-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                <span className={values.distanceCm < 30 ? "text-rose-500 font-bold" : ""}>
                  Near (&lt;30cm)
                </span>
                <span>Mid (120cm)</span>
                <span>Far (400cm)</span>
              </div>
            </div>
          )}

          {/* 4. LDR Photoresistor */}
          {(activeTab === "all" || hasLdr) && (
            <div className="space-y-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                  <Sun className="h-3 w-3 text-amber-500" /> Ambient Light (LDR)
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {values.lightLux} Lux
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="10"
                value={values.lightLux}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onChange((prev) => ({ ...prev, lightLux: val }));
                }}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-amber-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                <button
                  onClick={() => onChange((prev) => ({ ...prev, lightLux: 10 }))}
                  className="hover:text-indigo-600"
                >
                  Dark (10lx)
                </button>
                <button
                  onClick={() => onChange((prev) => ({ ...prev, lightLux: 400 }))}
                  className="hover:text-amber-600"
                >
                  Room (400lx)
                </button>
                <button
                  onClick={() => onChange((prev) => ({ ...prev, lightLux: 950 }))}
                  className="hover:text-yellow-600 font-bold"
                >
                  Sun (950lx)
                </button>
              </div>
            </div>
          )}

          {/* 5. Potentiometer */}
          {(activeTab === "all" || hasPot) && (
            <div className="space-y-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                  <Gauge className="h-3 w-3 text-purple-500" /> Potentiometer
                </span>
                <div className="text-right font-mono text-[10px]">
                  <span className="font-bold text-purple-600 dark:text-purple-400">
                    {values.potentiometerVal}
                  </span>
                  <span className="text-zinc-400 ml-1">
                    ({((values.potentiometerVal / 1023) * 3.3).toFixed(2)}V)
                  </span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1023"
                value={values.potentiometerVal}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onChange((prev) => ({ ...prev, potentiometerVal: val }));
                }}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-purple-500"
              />
            </div>
          )}

          {/* 6. MQ-2 Gas & Smoke Sensor */}
          {(activeTab === "all" || hasGas) && (
            <div className="space-y-1.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                  <Flame className="h-3 w-3 text-orange-500" /> Gas Concentration
                </span>
                <span
                  className={`font-mono font-bold ${
                    values.gasPpm > 500
                      ? "text-rose-600 dark:text-rose-400 animate-pulse"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {values.gasPpm} PPM
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1000"
                value={values.gasPpm}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onChange((prev) => ({ ...prev, gasPpm: val }));
                }}
                className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-orange-500"
              />
              <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                <span>Clean (&lt;150)</span>
                <span className={values.gasPpm > 500 ? "text-rose-600 font-bold" : ""}>
                  Hazard (&gt;500)
                </span>
              </div>
            </div>
          )}

          {/* 7. Virtual Inputs (Momentary Button, Toggle Switch, PIR Motion) */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Digital Switches & Triggers
            </span>

            {/* Tactile Button */}
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 gap-1.5">
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  Push Button
                </div>
                <div className="text-[8px] font-mono text-zinc-400">
                  Hold / [Space]
                </div>
              </div>
              <button
                onMouseDown={() => onChange((prev) => ({ ...prev, isButtonPressed: true }))}
                onMouseUp={() => onChange((prev) => ({ ...prev, isButtonPressed: false }))}
                onTouchStart={() => onChange((prev) => ({ ...prev, isButtonPressed: true }))}
                onTouchEnd={() => onChange((prev) => ({ ...prev, isButtonPressed: false }))}
                className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold transition-all shadow-xs select-none shrink-0 ${
                  values.isButtonPressed
                    ? "bg-cyan-600 text-white scale-95 shadow-inner ring-1 ring-cyan-400"
                    : "bg-zinc-200 text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                }`}
              >
                {values.isButtonPressed ? "PRESSED" : "HOLD PRESS"}
              </button>
            </div>

            {/* Latching Toggle Switch */}
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 gap-1.5">
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  Toggle Switch
                </div>
                <div className="text-[8px] font-mono text-zinc-400">
                  Latching ON/OFF
                </div>
              </div>
              <button
                onClick={() =>
                  onChange((prev) => ({ ...prev, isSwitchLatching: !prev.isSwitchLatching }))
                }
                className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold transition-colors shrink-0 ${
                  values.isSwitchLatching
                    ? "bg-emerald-600 text-white ring-1 ring-emerald-400"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                }`}
              >
                {values.isSwitchLatching ? "SW: ON" : "SW: OFF"}
              </button>
            </div>

            {/* PIR Motion Trigger */}
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 gap-1.5">
              <div className="min-w-0">
                <div className="text-[10px] font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  PIR Motion
                </div>
                <div className="text-[8px] font-mono text-zinc-400">
                  {motionCountdown ? `Pulse: ${motionCountdown}s` : "3s Pulse"}
                </div>
              </div>
              <button
                onClick={handleTriggerMotion}
                disabled={Boolean(motionCountdown)}
                className={`px-2 py-1 rounded-md text-[9px] font-mono font-bold transition-colors shrink-0 ${
                  values.isMotionTriggered
                    ? "bg-indigo-600 text-white animate-pulse"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300"
                }`}
              >
                {values.isMotionTriggered ? "MOVING" : "PULSE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
