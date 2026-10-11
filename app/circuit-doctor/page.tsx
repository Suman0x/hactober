"use client";

import React, { useState, useRef } from "react";
import {
  Activity,
  Upload,
  Camera,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Save,
  RotateCcw,
  Loader2,
  Cpu,
  FileText,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Zap,
} from "lucide-react";
import { VirtualMultimeter } from "@/components/doctor/VirtualMultimeter";
import { CameraCaptureModal } from "@/components/doctor/CameraCaptureModal";
import { BoardPinoutDrawer } from "@/components/doctor/BoardPinoutDrawer";
import { DiagnosticReportModal } from "@/components/doctor/DiagnosticReportModal";
import { SafetyRiskGauge } from "@/components/doctor/SafetyRiskGauge";
import { CIRCUIT_DOCTOR_PRESETS, CircuitDoctorPreset } from "@/lib/doctorPresets";

export default function CircuitDoctorPage() {
  // Input context state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [boardType, setBoardType] = useState("ESP32");
  const [knownComponents, setKnownComponents] = useState("");
  const [expectedBehavior, setExpectedBehavior] = useState("");
  const [actualBehavior, setActualBehavior] = useState("");
  const [errorLogs, setErrorLogs] = useState("");
  const [firmwareCode, setFirmwareCode] = useState("");

  // Image inspection toolbar state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotationDeg, setRotationDeg] = useState<number>(0);
  const [isContrastBoosted, setIsContrastBoosted] = useState<boolean>(false);
  const [isFullscreenImage, setIsFullscreenImage] = useState<boolean>(false);

  // Modals & Drawers state
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isPinoutDrawerOpen, setIsPinoutDrawerOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<"hypotheses" | "multimeter" | "observations">("hypotheses");
  const [testOutcomes, setTestOutcomes] = useState<Record<string, "Passed" | "Failed" | "Inconclusive">>({});
  const [testNotes, setTestNotes] = useState<Record<string, string>>({});
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analyzedAt, setAnalyzedAt] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Preset Scenario
  const handleLoadPreset = (preset: CircuitDoctorPreset) => {
    setBoardType(preset.boardType);
    setKnownComponents(preset.knownComponents);
    setExpectedBehavior(preset.expectedBehavior);
    setActualBehavior(preset.actualBehavior);
    setFirmwareCode(preset.firmwareCode);
    setSelectedImage(preset.svgDataUri);
    setImageFileName(`${preset.id}.svg`);
    setAnalysis(null);
    setAnalyzedAt("");
    setAnalysisError(null);
    setTestOutcomes({});
    setTestNotes({});
    setZoomLevel(1);
    setRotationDeg(0);
    setIsContrastBoosted(false);
  };

  // Image processing & client-side compression
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPEG, PNG, WebP).");
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      alert("Image size should be less than 12MB.");
      return;
    }

    setImageFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setSelectedImage(optimizedDataUrl);
        } else {
          setSelectedImage(rawDataUrl);
        }
        setAnalysis(null);
        setAnalysisError(null);
      };
      img.onerror = () => {
        setSelectedImage(rawDataUrl);
        setAnalysis(null);
        setAnalysisError(null);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Camera Capture callback
  const handleCameraCapture = (dataUrl: string, fileName: string) => {
    setSelectedImage(dataUrl);
    setImageFileName(fileName);
    setAnalysis(null);
    setAnalysisError(null);
  };

  // Run AI Analysis
  const handleAnalyze = async () => {
    if (!selectedImage) {
      alert("Please upload or capture a circuit photograph first.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch("/api/doctor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          boardType,
          knownComponents,
          expectedBehavior,
          actualBehavior,
          errorLogs,
          firmwareCode,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setAnalysis(data.analysis);
        setAnalyzedAt(new Date().toISOString());
        setAnalysisError(null);
      } else {
        setAnalysisError(data.error || "Analysis request failed.");
      }
    } catch (err: any) {
      setAnalysisError(`Network error: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Record test result (from list or multimeter)
  const handleRecordTest = (
    faultId: string,
    outcome: "Passed" | "Failed" | "Inconclusive",
    notes?: string
  ) => {
    setTestOutcomes((prev) => ({ ...prev, [faultId]: outcome }));
    if (notes) {
      setTestNotes((prev) => ({ ...prev, [faultId]: notes }));
    }
  };

  // Save investigation to database
  const handleSaveSession = async () => {
    if (!analysis) return;
    try {
      const res = await fetch("/api/doctor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Investigation: ${boardType} - ${new Date().toLocaleDateString()}`,
          boardType,
          imageFileName,
          expectedBehavior,
          actualBehavior,
          errorLogs,
          observations: analysis.visibleObservations,
          hypotheses: analysis.potentialFaults,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSavedSessionId(data.session.id);
        alert("Diagnostic investigation session saved to database!");
      }
    } catch (err: any) {
      alert("Failed to save session.");
    }
  };

  // Compute Safety Risk Gauge Level & Score
  const calculateSafetyMetrics = () => {
    if (!analysis) {
      return { level: "LOW" as const, score: 20, hazards: [] };
    }

    const hazards: string[] = [];
    if (analysis.safetyWarnings && analysis.safetyWarnings.length > 0) {
      hazards.push(...analysis.safetyWarnings);
    }

    const faults: any[] = analysis.potentialFaults || [];
    let isCritical = false;
    let isHigh = false;
    let isMedium = false;

    faults.forEach((f) => {
      const text = `${f.title} ${f.explanation} ${f.recommendedTest}`.toLowerCase();
      if (
        text.includes("reverse") ||
        text.includes("short") ||
        text.includes("overvoltage") ||
        text.includes("burning") ||
        text.includes("hot")
      ) {
        isCritical = true;
        hazards.push(`High risk fault: ${f.title}`);
      } else if (
        text.includes("brownout") ||
        text.includes("inrush") ||
        text.includes("5v to 3.3v") ||
        text.includes("regulator")
      ) {
        isHigh = true;
      } else if (
        text.includes("floating") ||
        text.includes("pull-up") ||
        text.includes("i2c") ||
        text.includes("swap")
      ) {
        isMedium = true;
      }
    });

    if (isCritical || hazards.length >= 2) {
      return { level: "CRITICAL" as const, score: 94, hazards };
    }
    if (isHigh) {
      return { level: "HIGH" as const, score: 76, hazards };
    }
    if (isMedium) {
      return { level: "MEDIUM" as const, score: 48, hazards };
    }
    return { level: "LOW" as const, score: 22, hazards };
  };

  const safetyMetrics = calculateSafetyMetrics();

  // Prepare hypotheses list for Multimeter and Report Modal
  const formattedHypotheses = (analysis?.potentialFaults || []).map(
    (f: any, idx: number) => ({
      id: f.id || `fault-${idx}`,
      title: f.title || `Hypothesis ${idx + 1}`,
      probability: f.confidence || "Medium",
      likelyRootCause: f.explanation || "",
      recommendedTest: f.recommendedTest || "Perform DMM probe check",
      expectedResult: f.expectedResult || "Nominal voltage/resistance",
      safetyPrecaution:
        f.safetyPrecaution || "De-energize circuit before switching meter modes",
      status: testOutcomes[f.id || `fault-${idx}`] || ("Unverified" as const),
      testNotes: testNotes[f.id || `fault-${idx}`],
    })
  );

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-zinc-800 gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/20">
                <Activity className="h-4.5 w-4.5" />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Circuit Doctor
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  Obsidian Hardware Lab
                </span>
              </h1>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Multimodal optical vision diagnostics, interactive virtual multimeter verification & hardware pinout specs.
            </p>
          </div>

          {/* Quick Tools & Session Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsPinoutDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all shadow-xs"
            >
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span>Pinout Reference</span>
            </button>

            {analysis && (
              <>
                <button
                  onClick={() => {
                    if (!analyzedAt) setAnalyzedAt(new Date().toISOString());
                    setIsReportModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 hover:text-cyan-200 transition-all shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Export Report</span>
                </button>

                <button
                  onClick={handleSaveSession}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
                    savedSessionId
                      ? "border-emerald-600 bg-emerald-950/40 text-emerald-300"
                      : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <Save
                    className={`h-3.5 w-3.5 ${
                      savedSessionId ? "text-emerald-400" : "text-zinc-400"
                    }`}
                  />
                  <span>
                    {savedSessionId
                      ? "Saved (#" + savedSessionId.slice(-4) + ")"
                      : "Save Session"}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 1-Click Sample Presets Ribbon */}
        <div className="p-3.5 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Instant Hardware Lab Presets (1-Click Test Scenarios)
            </span>
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              Preloads schematic, symptoms, & firmware code
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {CIRCUIT_DOCTOR_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                className="p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 hover:border-cyan-500/50 hover:bg-cyan-950/10 text-left transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-cyan-300 border border-zinc-800 group-hover:border-cyan-700/50">
                      {preset.boardType}
                    </span>
                    <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-400">
                      {preset.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-white leading-snug line-clamp-1">
                    {preset.name}
                  </div>
                </div>
                <span className="text-[10px] text-cyan-400/80 group-hover:text-cyan-300 font-mono mt-1 flex items-center gap-1">
                  Load Specimen ⚡
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main 2-Column Diagnostic Workbench */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Visual Capture & Technical Context */}
          <div className="lg:col-span-5 space-y-4">
            {/* Image Station */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center">
                    1
                  </span>
                  Circuit Specimen Photograph
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsCameraModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-medium transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Live Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[11px] font-medium transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {selectedImage ? (
                <div className="space-y-2">
                  {/* Inspection Action Toolbar */}
                  <div className="flex items-center justify-between bg-zinc-950 p-1.5 rounded-lg border border-zinc-800 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setZoomLevel(1)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title="Reset Zoom"
                      >
                        {Math.round(zoomLevel * 100)}%
                      </button>
                      <span className="w-px h-3 bg-zinc-800 mx-0.5" />
                      <button
                        onClick={() => setRotationDeg((r) => (r + 90) % 360)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 flex items-center gap-1 text-[11px]"
                        title="Rotate 90 Degrees"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono">{rotationDeg}°</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setIsContrastBoosted((c) => !c)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors border flex items-center gap-1 ${
                          isContrastBoosted
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200"
                        }`}
                        title="Boost contrast to read resistor color bands"
                      >
                        <Sliders className="w-3 h-3" />
                        Resistor Boost
                      </button>
                      <button
                        onClick={() => setIsFullscreenImage((f) => !f)}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                        title={isFullscreenImage ? "Exit Fullscreen" : "Fullscreen"}
                      >
                        {isFullscreenImage ? (
                          <Minimize2 className="w-3.5 h-3.5" />
                        ) : (
                          <Maximize2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Image Display Frame */}
                  <div
                    className={`relative rounded-xl border border-zinc-800 overflow-hidden bg-black flex items-center justify-center transition-all ${
                      isFullscreenImage
                        ? "fixed inset-8 z-50 shadow-2xl bg-black/95 p-4"
                        : "max-h-72 min-h-[220px]"
                    }`}
                  >
                    <div className="overflow-auto w-full h-full flex items-center justify-center p-2">
                      <img
                        src={selectedImage}
                        alt="Circuit preview"
                        style={{
                          transform: `scale(${zoomLevel}) rotate(${rotationDeg}deg)`,
                          filter: isContrastBoosted
                            ? "contrast(180%) brightness(110%) saturate(140%)"
                            : "none",
                          transition: "transform 0.2s ease-out, filter 0.2s ease-out",
                        }}
                        className="max-h-64 object-contain max-w-full"
                      />
                    </div>

                    {isFullscreenImage && (
                      <button
                        onClick={() => setIsFullscreenImage(false)}
                        className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-900 text-white border border-zinc-700"
                      >
                        <Minimize2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                      {imageFileName || "specimen_image.jpg"}
                    </div>

                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setAnalysis(null);
                        }}
                        className="rounded bg-zinc-900/90 border border-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-rose-400 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) {
                      processImageFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-8 text-center transition-all hover:border-cyan-500/50 hover:bg-cyan-950/10 group"
                >
                  <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-white">
                    Drop circuit photograph or click to browse
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1">
                    Clear top-down or 45° angle photograph (JPEG, PNG, WebP)
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) processImageFile(e.target.files[0]);
                }}
              />
            </div>

            {/* Technical Symptoms & Context */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3 text-xs">
              <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px] flex items-center justify-center">
                  2
                </span>
                Technical Symptoms & Environment
              </span>

              <div>
                <label className="text-[11px] font-medium text-zinc-400">Target MCU Board Architecture</label>
                <select
                  value={boardType}
                  onChange={(e) => setBoardType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 font-mono text-xs text-zinc-100 focus:outline-none focus:border-cyan-500/60"
                >
                  <option value="ESP32">ESP32 DevKit V1 (3.3V Logic)</option>
                  <option value="Arduino Uno">Arduino Uno R3 (5V Logic)</option>
                  <option value="Arduino Nano">Arduino Nano V3 (5V Logic)</option>
                  <option value="Raspberry Pi Pico">Raspberry Pi Pico RP2040 (3.3V Logic)</option>
                  <option value="STM32F103">STM32F103C8T6 Blue Pill (3.3V Logic)</option>
                  <option value="Custom Board">Other / Custom Prototype</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400">Known Connected Components</label>
                <input
                  type="text"
                  value={knownComponents}
                  onChange={(e) => setKnownComponents(e.target.value)}
                  placeholder="e.g. DHT22 on GPIO 4, SSD1306 OLED, 5V Relay"
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-zinc-400">Expected Behavior</label>
                  <textarea
                    rows={2}
                    value={expectedBehavior}
                    onChange={(e) => setExpectedBehavior(e.target.value)}
                    placeholder="e.g. OLED shows temperature"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-zinc-400">Actual Failure / Symptom</label>
                  <textarea
                    rows={2}
                    value={actualBehavior}
                    onChange={(e) => setActualBehavior(e.target.value)}
                    placeholder="e.g. Blank display, MCU gets hot"
                    className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400">Firmware Code or Serial Log (Optional)</label>
                <textarea
                  rows={3}
                  value={firmwareCode}
                  onChange={(e) => setFirmwareCode(e.target.value)}
                  placeholder="Paste snippet of setup(), pinMode(), or terminal error logs..."
                  className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 p-2 font-mono text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!selectedImage || isAnalyzing}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 py-2.5 font-semibold text-white shadow-lg shadow-cyan-600/20 disabled:opacity-50 disabled:bg-zinc-800 transition-all text-xs border border-cyan-400/40"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing Circuit Specimen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-cyan-200" />
                    <span>Run Circuit Doctor Diagnostics</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Evidence-Based Analysis, Multimeter, & Hypotheses */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {isAnalyzing ? (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
                <Loader2 className="h-9 w-9 animate-spin text-cyan-400 mb-4" />
                <h3 className="text-sm font-bold text-white">
                  Optical AI Inspecting Circuit Topology...
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Detecting discrete packages, tracing power rails, checking pin orientations, and computing risk hypotheses.
                </p>
              </div>
            ) : analysis ? (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                {/* Safety Risk Gauge */}
                <SafetyRiskGauge
                  level={safetyMetrics.level}
                  score={safetyMetrics.score}
                  hazards={safetyMetrics.hazards}
                />

                {/* Diagnostic Overview Banner */}
                <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5 text-xs">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono">
                    <Activity className="h-4 w-4" />
                    <span>Diagnostic Overview & Findings</span>
                  </div>
                  <p className="mt-1.5 leading-relaxed text-zinc-300">
                    {analysis.summary}
                  </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-zinc-800 text-xs gap-1">
                  <button
                    onClick={() => setActiveTab("hypotheses")}
                    className={`py-2 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "hypotheses"
                        ? "border-cyan-400 text-cyan-300 font-semibold"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>Fault Hypotheses</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
                      {analysis.potentialFaults?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("multimeter")}
                    className={`py-2 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "multimeter"
                        ? "border-cyan-400 text-cyan-300 font-semibold"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Virtual Multimeter</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                      DMM
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("observations")}
                    className={`py-2 px-3 font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === "observations"
                        ? "border-cyan-400 text-cyan-300 font-semibold"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span>Observations & Components</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-800 text-zinc-300">
                      {analysis.visibleObservations?.length || 0}
                    </span>
                  </button>
                </div>

                {/* Tab 1: Fault Hypotheses List */}
                {activeTab === "hypotheses" && (
                  <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
                    {analysis.potentialFaults?.map((fault: any, index: number) => {
                      const faultId = fault.id || `fault-${index}`;
                      const outcome = testOutcomes[faultId];
                      return (
                        <div
                          key={faultId}
                          className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-white font-mono">
                              {fault.title}
                            </span>
                            <span
                              className={`rounded border px-2 py-0.5 text-[10px] font-mono font-semibold ${
                                fault.confidence === "High"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  : fault.confidence === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                              }`}
                            >
                              {fault.confidence} Confidence
                            </span>
                          </div>

                          <p className="text-zinc-300 leading-relaxed">
                            {fault.explanation}
                          </p>

                          <div className="rounded-lg bg-zinc-900/90 p-3 border border-zinc-800 space-y-2 font-mono text-[11px]">
                            <div>
                              <span className="text-cyan-400 font-semibold">
                                Recommended Diagnostic Test:
                              </span>
                              <p className="text-zinc-300 mt-0.5">
                                {fault.recommendedTest}
                              </p>
                            </div>
                            <div className="pt-1.5 border-t border-zinc-800">
                              <span className="text-emerald-400 font-semibold">
                                Expected Multimeter Reading:
                              </span>
                              <p className="text-zinc-300 mt-0.5">
                                {fault.expectedResult}
                              </p>
                            </div>
                          </div>

                          {testNotes[faultId] && (
                            <div className="p-2 rounded bg-cyan-950/20 border border-cyan-800/30 font-mono text-[11px] text-cyan-300">
                              <span>Probe Reading: {testNotes[faultId]}</span>
                            </div>
                          )}

                          {/* Interactive User Test Result Recorder */}
                          <div className="border-t border-zinc-800 pt-2.5 flex items-center justify-between">
                            <span className="font-mono text-[11px] text-zinc-400 font-medium">
                              Verification Outcome:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleRecordTest(faultId, "Passed")}
                                className={`rounded px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                                  outcome === "Passed"
                                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-emerald-500 hover:text-emerald-300"
                                }`}
                              >
                                Passed
                              </button>
                              <button
                                onClick={() => handleRecordTest(faultId, "Failed")}
                                className={`rounded px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                                  outcome === "Failed"
                                    ? "bg-rose-600 text-white border-rose-500 shadow-sm"
                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-rose-500 hover:text-rose-300"
                                }`}
                              >
                                Failed
                              </button>
                              <button
                                onClick={() => handleRecordTest(faultId, "Inconclusive")}
                                className={`rounded px-2.5 py-1 text-[11px] font-semibold border transition-all ${
                                  outcome === "Inconclusive"
                                    ? "bg-amber-600 text-white border-amber-500 shadow-sm"
                                    : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-amber-500 hover:text-amber-300"
                                }`}
                              >
                                Inconclusive
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Tab 2: Interactive Virtual Multimeter */}
                {activeTab === "multimeter" && (
                  <div className="space-y-4">
                    <VirtualMultimeter
                      hypotheses={formattedHypotheses}
                      onRecordResult={(id, outcome, readingNotes) =>
                        handleRecordTest(id, outcome, readingNotes)
                      }
                    />
                  </div>
                )}

                {/* Tab 3: Visible Observations & Components */}
                {activeTab === "observations" && (
                  <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
                    {analysis.visibleObservations?.map((obs: any, idx: number) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-100">
                            {obs.description}
                          </span>
                          <span className="rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[9px] font-mono text-zinc-300">
                            {obs.confidence} Evidence
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-zinc-400 font-mono">
                          Evidence: {obs.evidence}
                        </p>
                      </div>
                    ))}

                    <div className="pt-2">
                      <span className="font-mono text-xs font-bold text-white">
                        Detected Discrete Components
                      </span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {analysis.identifiedComponents?.map((comp: any, idx: number) => (
                          <div
                            key={idx}
                            className="rounded border border-zinc-800 bg-zinc-950/70 p-2.5 font-mono text-[11px]"
                          >
                            <span className="font-bold text-white">
                              {comp.name}
                            </span>
                            <span className="block text-[10px] text-zinc-400 mt-0.5">
                              Status: {comp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : analysisError ? (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-zinc-100">
                <AlertTriangle className="h-8 w-8 text-rose-400 mb-3" />
                <h3 className="text-sm font-bold tracking-tight">AI Vision Notice</h3>
                <p className="text-xs text-zinc-400 mt-1.5 max-w-md leading-relaxed">
                  {analysisError}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={handleAnalyze}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-all"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Retry Analysis</span>
                  </button>
                  <button
                    onClick={() => setAnalysisError(null)}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-400">
                <Activity className="h-8 w-8 text-zinc-600 mb-3" />
                <h3 className="text-sm font-semibold text-zinc-200">
                  Ready for Circuit Diagnosis
                </h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Upload a photo of your hardware setup or click one of the 1-Click Lab Presets above to begin an evidence-based investigation.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Hardware Board Pinout Reference Drawer */}
      <BoardPinoutDrawer
        isOpen={isPinoutDrawerOpen}
        onClose={() => setIsPinoutDrawerOpen(false)}
      />

      {/* Exportable Diagnostic Incident Report Modal */}
      <DiagnosticReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        imagePreview={selectedImage}
        boardModel={boardType}
        circuitType={knownComponents || "Prototype Breadboard Setup"}
        symptoms={actualBehavior}
        components={(analysis?.identifiedComponents || []).map((c: any) => ({
          label: c.name,
          confidence: 0.9,
          category: c.status || "Component",
        }))}
        hypotheses={formattedHypotheses}
        riskLevel={safetyMetrics.level}
        analyzedAt={analyzedAt}
      />
    </div>
  );
}
