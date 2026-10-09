"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComponentArtwork } from "@/components/circuits/ComponentArtwork";
import {
  Sparkles,
  Cpu,
  Activity,
  ArrowRight,
  Layers,
  CheckCircle2,
  Package,
  FolderKanban,
  Zap,
  Terminal,
  ShieldCheck,
  Search,
  Sliders,
  AlertTriangle,
  FileCode,
  DollarSign,
  Play,
  RotateCcw,
  Check,
  Compass,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [projectInput, setProjectInput] = useState("");
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
  const [activeDemoTab, setActiveDemoTab] = useState<"builder" | "studio" | "doctor">("builder");
  const [demoSimActive, setDemoSimActive] = useState(true);

  useEffect(() => {
    async function fetchSamples() {
      try {
        const res = await fetch("/api/projects?isSample=true");
        const data = await res.json();
        if (data.ok && data.projects) {
          setFeaturedProjects(data.projects.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch sample projects:", err);
      }
    }
    fetchSamples();
  }, []);

  const handleStartBuilding = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectInput.trim()) {
      router.push(`/builder?prompt=${encodeURIComponent(projectInput.trim())}`);
    } else {
      router.push("/builder");
    }
  };

  const samplePrompts = [
    "ESP32 Smart Irrigation with soil moisture sensor & relay pump",
    "Arduino Uno OLED weather station with DHT22 & I2C display",
    "Raspberry Pi Pico robotic arm with SG90 servo controllers",
  ];

  return (
    <div className="relative min-h-full bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* Top Hero Section */}
        <section className="space-y-6 pt-4 text-center sm:text-left">
          <div className="flex flex-col space-y-3">
            {/* Value Badge */}
            <div className="inline-flex items-center gap-2 self-center sm:self-start rounded-full border border-indigo-500/20 bg-indigo-50/70 px-3 py-1 text-[11px] font-mono font-medium text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-300">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              <span className="font-semibold text-zinc-950 dark:text-zinc-100">CIRCUITDOCTOR</span>
              <span className="text-indigo-300 dark:text-indigo-700">•</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">HARDWARE AI WORKSPACE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-zinc-950 dark:text-white leading-[1.12]">
              From an idea to a <br className="hidden sm:inline" />
              <span className="text-zinc-500 dark:text-zinc-400">
                working physical circuit.
              </span>
            </h1>

            {/* Clear Plain Value Proposition */}
            <p className="max-w-3xl text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mx-auto sm:mx-0">
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">CircuitDoctor</strong> eliminates guesswork in embedded systems.
              Describe any IoT idea to generate complete <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">BOMs with ₹ pricing &amp; pinouts</span>, safely test with <span className="inline-flex items-center rounded-md bg-sky-500/10 px-1.5 py-0.5 text-xs font-semibold text-sky-700 dark:text-sky-400 border border-sky-500/20">real-time circuit simulation</span>, or photograph a malfunctioning breadboard to <span className="inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">diagnose faults with AI vision</span>.
            </p>
          </div>

          {/* Quick Natural Language Prompt Bar */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
            <form onSubmit={handleStartBuilding} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  value={projectInput}
                  onChange={(e) => setProjectInput(e.target.value)}
                  placeholder="Describe what you want to build: e.g. ESP32 soil moisture sensor with OLED display and 5V relay..."
                  className="w-full rounded-xl bg-zinc-50 py-2.5 pl-10 pr-3 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:bg-zinc-800/80 dark:text-zinc-100 dark:focus:ring-zinc-600 border border-zinc-200 dark:border-zinc-700/60"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 px-5 py-2.5 text-xs font-semibold shadow-xs transition-all shrink-0 group"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span>Build with AI</span>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            {/* Quick Inspiration Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
              <span className="font-mono text-zinc-400 font-medium">Try templates:</span>
              {[
                { name: "ESP32 Smart Irrigation", dot: "bg-emerald-500" },
                { name: "Arduino Uno OLED weather station", dot: "bg-sky-500" },
                { name: "Raspberry Pi Pico robotic arm", dot: "bg-violet-500" },
              ].map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => setProjectInput(tmpl.name)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50/80 px-2.5 py-1 text-left text-zinc-700 hover:border-zinc-400 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 transition-all text-xs"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${tmpl.dot}`} />
                  <span>{tmpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core Feature Highlights Strip */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>INR (₹) Cost-Optimized BOM</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
              <span>Interactive Voltage &amp; Pin DRC Checks</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
              <span>Multimeter Fault Isolation</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-violet-500" />
              <span>Google Gemma AI Integration</span>
            </span>
          </div>
        </section>

        {/* Interactive Walkthrough */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 tracking-wider flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                Interactive Walkthrough
              </span>
              <h2 className="text-base sm:text-lg font-bold text-zinc-950 dark:text-zinc-50">
                Understand CircuitDoctor in 3 Steps
              </h2>
              <p className="text-xs text-zinc-500">
                Switch tabs below to see how our three core engines work together.
              </p>
            </div>

            {/* Interactive Tab Selectors */}
            <div className="flex items-center rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/80 text-xs font-semibold gap-1 self-start sm:self-auto border border-zinc-200/50 dark:border-zinc-700/50">
              <button
                onClick={() => setActiveDemoTab("builder")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  activeDemoTab === "builder"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${activeDemoTab === "builder" ? "text-violet-400 dark:text-violet-600" : "text-violet-500"}`} />
                <span>1. Architect (Builder)</span>
              </button>
              <button
                onClick={() => setActiveDemoTab("studio")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  activeDemoTab === "studio"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Cpu className={`h-3.5 w-3.5 ${activeDemoTab === "studio" ? "text-sky-400 dark:text-sky-600" : "text-sky-500"}`} />
                <span>2. Simulate (Studio)</span>
              </button>
              <button
                onClick={() => setActiveDemoTab("doctor")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  activeDemoTab === "doctor"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <Activity className={`h-3.5 w-3.5 ${activeDemoTab === "doctor" ? "text-amber-400 dark:text-amber-600" : "text-amber-500"}`} />
                <span>3. Troubleshoot (Doctor)</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Project Builder Showcase */}
          {activeDemoTab === "builder" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-5 space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200/80 px-2 py-0.5 text-[10px] font-mono font-bold dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60">
                  <Sparkles className="h-3 w-3 text-violet-500" />
                  <span>STEP 1: ARCHITECT FROM NATURAL LANGUAGE</span>
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  Type what you want to build. Get production-ready hardware specs.
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Provide your target MCU, concept, and budget limit. Gemma AI computes the exact Bill of Materials in Indian Rupees, assigns verified pinouts, and generates starter Arduino/C++ firmware.
                </p>

                <div className="space-y-1.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                    <span>Cost-optimized BOM with local Indian ₹ prices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                    <span>Pin-to-pin wiring map (VCC, GND, GPIO, I2C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
                    <span>Clean C++ starter firmware with pin definitions</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/builder"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all"
                  >
                    <span>Launch Project Builder</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>

              {/* Visual Mock Output Card */}
              <div className="md:col-span-7 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Generated: Smart Irrigation Controller
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    Total: ₹1,040 (Under ₹1,500 Target)
                  </span>
                </div>

                {/* BOM Preview Table */}
                <div className="rounded-lg bg-white p-2.5 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 text-[11px] space-y-1.5">
                  <div className="flex justify-between text-zinc-400 text-[10px] border-b border-zinc-100 dark:border-zinc-800 pb-1">
                    <span>Component</span>
                    <span>Pinout Connection</span>
                    <span>Price (₹)</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">ESP32 DevKit V1</span>
                    <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Core Controller</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹450</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                    <span>Capacitive Soil Sensor</span>
                    <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">GPIO 34 (ADC1)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹130</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                    <span>5V Single Relay Module</span>
                    <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">GPIO 26 (Digital OUT)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹95</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-800 dark:text-zinc-200">
                    <span>0.96&quot; I2C OLED Display</span>
                    <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">GPIO 21 (SDA) / 22 (SCL)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹220</span>
                  </div>
                </div>

                {/* Generated Code Snippet */}
                <div className="rounded-lg bg-zinc-950 p-2.5 text-[10px] font-mono space-y-1 border border-zinc-800/80">
                  <span className="text-zinc-500">{"// Starter Firmware Snippet (main.ino)"}</span>
                  <div>
                    <span className="text-pink-400 font-semibold">#define</span> <span className="text-indigo-300">SOIL_PIN</span> <span className="text-amber-300 font-bold">34</span>
                  </div>
                  <div>
                    <span className="text-pink-400 font-semibold">#define</span> <span className="text-indigo-300">RELAY_PIN</span> <span className="text-amber-300 font-bold">26</span>
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-sky-400">void</span> <span className="text-yellow-300">setup</span>() &#123; <span className="text-sky-300">pinMode</span>(RELAY_PIN, <span className="text-amber-300">OUTPUT</span>); <span className="text-emerald-300">Wire.begin</span>(21, 22); &#125;
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Circuit Studio Showcase */}
          {activeDemoTab === "studio" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-5 space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200/80 px-2 py-0.5 text-[10px] font-mono font-bold dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60">
                  <Cpu className="h-3 w-3 text-sky-500" />
                  <span>STEP 2: VISUAL HARDWARE SIMULATION</span>
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  Connect pins visually. Test simulations with zero fried chips.
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Place microcontrollers, sensors, and actuators on an interactive visual schematic canvas. Check voltage rails, watch real-time simulated outputs, and verify electrical design rules (DRC) before soldering.
                </p>

                <div className="space-y-1.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                    <span>Real-world jumper wire connections (VCC, GND, GPIO)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                    <span>Live virtual actuators: rotating servos, glowing LEDs, active relays</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
                    <span>Automated Electrical DRC catches short-circuits instantly</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/circuit-studio"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all"
                  >
                    <span>Open Circuit Studio Canvas</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>

              {/* Visual Mock Simulation Canvas Card */}
              <div className="md:col-span-7 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2 dark:border-zinc-700">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Live Simulation Running</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                    ⚡ 3.3V &amp; 5.0V Rails Energized
                  </span>
                </div>

                {/* Node Canvas Representation */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="rounded-lg bg-white p-2.5 border border-zinc-200 shadow-2xs dark:bg-zinc-900 dark:border-zinc-800 flex flex-col items-center text-center">
                    <div className="h-10 w-10 flex items-center justify-center p-0.5">
                      <ComponentArtwork type="esp32" size="sm" isSimulating={demoSimActive} />
                    </div>
                    <span className="mt-1 font-bold text-[11px] text-zinc-900 dark:text-zinc-100">ESP32 MCU</span>
                    <span className="mt-0.5 inline-flex items-center gap-1 text-[9px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded font-semibold border border-emerald-200/60 dark:border-emerald-800/60">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      Running
                    </span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-zinc-200 shadow-2xs dark:bg-zinc-900 dark:border-zinc-800 flex flex-col items-center text-center">
                    <div className="h-10 w-10 flex items-center justify-center p-0.5">
                      <ComponentArtwork type="dht22_sensor" size="sm" isSimulating={demoSimActive} />
                    </div>
                    <span className="mt-1 font-bold text-[11px] text-zinc-900 dark:text-zinc-100">DHT22</span>
                    <span className="mt-0.5 inline-flex items-center text-[9px] text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.2 rounded font-semibold border border-sky-200/60 dark:border-sky-800/60">
                      24.5°C • 58%
                    </span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-zinc-200 shadow-2xs dark:bg-zinc-900 dark:border-zinc-800 flex flex-col items-center text-center">
                    <div className="h-10 w-10 flex items-center justify-center p-0.5">
                      <ComponentArtwork type="relay_module" size="sm" isSimulating={demoSimActive} />
                    </div>
                    <span className="mt-1 font-bold text-[11px] text-zinc-900 dark:text-zinc-100">Relay 5V</span>
                    <span className="mt-0.5 inline-flex items-center text-[9px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded font-semibold border border-amber-200/60 dark:border-amber-800/60">
                      Closed (Active)
                    </span>
                  </div>
                </div>

                {/* Live Serial Monitor Output Bar */}
                <div className="rounded-lg bg-zinc-950 p-2.5 text-[10px] text-zinc-300 font-mono space-y-1 border border-zinc-800">
                  <div className="flex items-center justify-between text-zinc-500 text-[9px] pb-1 border-b border-zinc-800">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Terminal className="h-3 w-3 text-emerald-400" /> Serial Monitor (115200 baud)
                    </span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">0 DRC Warnings</span>
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">[14:15:02]</span> <span className="text-emerald-400">WiFi Connected:</span> 192.168.1.144
                  </div>
                  <div className="text-zinc-200">
                    <span className="text-zinc-500">[14:15:03]</span> Soil Moisture: <span className="text-amber-300 font-semibold">28% (Dry)</span> <span className="text-sky-400">➔ Tripping Relay GPIO 26</span>
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-zinc-500">[14:15:04]</span> Pump Relay Energized: <span className="text-emerald-400 font-bold">HIGH</span> (Duration 5s)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Circuit Doctor Showcase */}
          {activeDemoTab === "doctor" && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-5 space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 text-[10px] font-mono font-bold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
                  <Activity className="h-3 w-3 text-amber-500" />
                  <span>STEP 3: CAMERA MULTIMODAL DIAGNOSTICS</span>
                </div>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  Photograph broken hardware. Receive exact multimeter steps to fix it.
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  When a physical circuit won&apos;t boot, gets dangerously hot, or acts erratic, take a photo. Gemini AI identifies loose wires, reverse polarity, and calculates expected DC multimeter test voltages.
                </p>

                <div className="space-y-1.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span>Visual wire trace detects disconnected breadboard rows</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span>Expected multimeter readings (e.g. Test 3.3V vs 0.0V short)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span>Immediate Safety Warning alerts to prevent burning chips</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/circuit-doctor"
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all"
                  >
                    <span>Run Circuit Doctor</span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>

              {/* Visual Mock Diagnostics Output Card */}
              <div className="md:col-span-7 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-3 font-mono text-xs">
                {/* Safety Precaution Banner */}
                <div className="rounded-lg border border-rose-300 bg-rose-50/70 p-3 dark:bg-rose-950/30 dark:border-rose-900/60 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-[11px]">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>HARDWARE SAFETY ALERT DETECTED</span>
                  </div>
                  <p className="text-[11px] text-rose-800/90 dark:text-rose-200/90 leading-snug font-sans">
                    VCC and GND lines appear inverted on breadboard column 18. Disconnect 5V USB power immediately to prevent thermal damage to ESP32 regulator.
                  </p>
                </div>

                {/* Hypothesis and Test Recommendation */}
                <div className="rounded-lg bg-white p-3 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      Hypothesis 1: Short Circuit to Ground Rail
                    </span>
                    <span className="rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[9px] font-bold border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                      High Confidence
                    </span>
                  </div>

                  <div className="space-y-1 text-[10px]">
                    <div className="text-zinc-600 dark:text-zinc-400 font-semibold">
                      Diagnostic Test: Probe pin 2 (3V3) with DMM in DC Volts mode.
                    </div>
                    <div className="text-zinc-800 dark:text-zinc-200 font-semibold">
                      Expected Reading: <span className="text-emerald-600 dark:text-emerald-400 font-bold">3.30V ± 0.1V</span> (Measured: <span className="text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/40 px-1 rounded">0.04V short</span>).
                    </div>
                  </div>

                  {/* Interactive Outcome Recording */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[10px]">
                    <span className="text-zinc-500">Multimeter Outcome:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-emerald-600 text-white px-2 py-0.5 font-bold shadow-2xs">Passed</span>
                      <span className="rounded-md bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 px-2 py-0.5 font-semibold">Failed</span>
                      <span className="rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 px-2 py-0.5">Inconclusive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Metric Insights Strip */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 group hover:border-violet-300 dark:hover:border-violet-700/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                Core Engines
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 flex items-center gap-1.5 font-sans">
              <span>3 Tools</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 font-sans">
              Builder, Studio &amp; Doctor
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 group hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                Verification
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 flex items-center gap-1.5 font-sans">
              <span>Pin DRC</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 font-sans">
              Electrical rule checks
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 group hover:border-amber-300 dark:hover:border-amber-700/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                Diagnostics
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 flex items-center gap-1.5 font-sans">
              <span>Vision AI</span>
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 font-sans">
              Multimeter test steps
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900 group hover:border-sky-300 dark:hover:border-sky-700/60 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                Storage Layer
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            </div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-100 flex items-center gap-1.5 font-sans">
              <span>PostgreSQL</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 font-sans">
              Persistent workspaces
            </p>
          </div>
        </section>

        {/* Three Core Engineering Experiences Cards */}
        <section className="space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Platform Modules
            </span>
            <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
              The Three Core Engineering Experiences
            </h2>
            <p className="text-xs text-zinc-500">
              Everything needed to take embedded hardware from concept to functional reality.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Feature 1: Project Builder */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-800/80 transition-all group">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 border border-violet-200/80 dark:bg-violet-950/40 dark:text-violet-400 dark:border-violet-800/60 mb-4 shadow-2xs group-hover:scale-105 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">
                    Project Builder
                  </h3>
                  <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-mono text-violet-700 dark:border-violet-800/80 dark:bg-violet-950/40 dark:text-violet-300 font-semibold">
                    AI Architect
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Provide an idea, budget, and MCU to generate complete Bill of Materials, pin-to-pin wiring schematics, and compilable starter firmware.
                </p>

                <div className="mt-4 space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet-500" />
                    <span>Cost-optimized BOM (INR ₹)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet-500" />
                    <span>Firmware with pin assignments</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-violet-500" />
                    <span>Beginner to Advanced difficulty</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href="/builder"
                  className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-xs"
                >
                  <span>Launch Builder</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature 2: Circuit Studio */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-sky-300 dark:hover:border-sky-800/80 transition-all group">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60 mb-4 shadow-2xs group-hover:scale-105 transition-transform">
                  <Cpu className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">
                    Circuit Studio
                  </h3>
                  <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-mono text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-300 font-semibold">
                    Visual Canvas
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Design node schematics, connect verified pins, monitor live rail voltages, and run circuit simulations with real-time serial monitor outputs.
                </p>

                <div className="mt-4 space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>Named pins &amp; electrical DRC</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>Real-time hardware simulation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-sky-500" />
                    <span>Live virtual inputs (Sliders, Sensors)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href="/circuit-studio"
                  className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-xs"
                >
                  <span>Open Studio Canvas</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Circuit Doctor */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 hover:border-amber-300 dark:hover:border-amber-800/80 transition-all group">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60 mb-4 shadow-2xs group-hover:scale-105 transition-transform">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-100">
                    Circuit Doctor
                  </h3>
                  <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-700 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-300 font-semibold">
                    Diagnostics
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Upload a photo of your malfunctioning breadboard or PCB. Receive hypothesis test steps with expected multimeter readings to isolate faults.
                </p>

                <div className="mt-4 space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                    <span>Visual wiring error detection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                    <span>Multimeter expected DC voltages</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                    <span>Hardware hazard &amp; short circuit alerts</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <Link
                  href="/circuit-doctor"
                  className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-xs"
                >
                  <span>Run Circuit Doctor</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Hardware Components Ecosystem Reel */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Component Database
              </span>
              <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
                Verified Microcontrollers, Sensors &amp; Actuators
              </h2>
              <p className="text-xs text-zinc-500">
                Engineered with accurate pinouts, voltage levels, and vector schematics.
              </p>
            </div>
            <Link
              href="/components"
              className="flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
            >
              <span>Explore catalogue</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { type: "esp32", name: "ESP32 DevKit", category: "Microcontroller", logic: "3.3V Logic", badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60" },
              { type: "arduino_uno", name: "Arduino Uno", category: "Microcontroller", logic: "5.0V Logic", badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60" },
              { type: "pico", name: "Raspberry Pi Pico", category: "Microcontroller", logic: "3.3V Logic", badgeColor: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60" },
              { type: "dht22_sensor", name: "DHT22 Sensor", category: "Environmental", logic: "3.3V - 5V", badgeColor: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60" },
              { type: "oled_display", name: "SSD1306 OLED", category: "Display (I2C)", logic: "I2C Display", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60" },
              { type: "relay_module", name: "5V Relay", category: "Actuator", logic: "Optocoupled", badgeColor: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60" },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={`/builder?prompt=${encodeURIComponent("Build a project using " + item.name)}`}
                className="group flex flex-col items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 text-center shadow-2xs hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 transition-all hover:scale-[1.02]"
              >
                <div className="h-14 w-14 flex items-center justify-center p-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/60">
                  <ComponentArtwork type={item.type} size="md" />
                </div>
                <div className="mt-2 min-w-0 w-full">
                  <span className="block font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {item.name}
                  </span>
                  <span className={`inline-block mt-1 text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border ${item.badgeColor} truncate max-w-full`}>
                    {item.logic}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Tested Hardware Projects */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Reference Designs
              </span>
              <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
                Tested Hardware Projects
              </h2>
              <p className="text-xs text-zinc-500">
                Verified hardware architectures stored directly in PostgreSQL with firmware &amp; pin DRC.
              </p>
            </div>
            <Link
              href="/discover"
              className="flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
            >
              <span>View all projects</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featuredProjects.map((p) => {
              const artworkType = p.board === "ESP32" ? "esp32" : p.board?.includes("Uno") ? "arduino_uno" : "pico";

              return (
                <div
                  key={p.id}
                  className="flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded bg-zinc-50 dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                          <ComponentArtwork type={artworkType} size="sm" />
                        </div>
                        <span className="font-mono text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {p.board}
                        </span>
                      </div>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium ${
                        p.difficulty?.toLowerCase().includes("beg")
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : p.difficulty?.toLowerCase().includes("adv")
                          ? "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/70 dark:bg-violet-950/40 dark:text-violet-300"
                          : "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/70 dark:bg-sky-950/40 dark:text-sky-300"
                      }`}>
                        {p.difficulty}
                      </span>
                    </div>

                    <h3 className="mt-3 text-sm font-bold text-zinc-950 dark:text-zinc-100">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                      ₹{p.budgetInr}
                    </span>
                    <Link
                      href={`/projects/${p.id}`}
                      className="flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100 transition-colors"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Workflow Roadmap */}
        <section className="space-y-4">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              Engineering Pipeline
            </span>
            <h2 className="text-lg font-bold tracking-tight text-zinc-950 dark:text-zinc-100">
              Four-Phase Hardware Development Lifecycle
            </h2>
            <p className="text-xs text-zinc-500">
              How the tools integrate to support your embedded development journey from idea to working hardware.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-800/60 transition-all shadow-xs">
              <span className="inline-block rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 font-mono text-[11px] font-bold text-violet-700 dark:border-violet-800/80 dark:bg-violet-950/40 dark:text-violet-300">
                01. Architecture
              </span>
              <h4 className="mt-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Project Builder
              </h4>
              <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                Define idea, budget &amp; MCU to generate pin-to-pin wiring and starter firmware.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 hover:border-sky-300 dark:hover:border-sky-800/60 transition-all shadow-xs">
              <span className="inline-block rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 font-mono text-[11px] font-bold text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-300">
                02. Design &amp; DRC
              </span>
              <h4 className="mt-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Circuit Studio
              </h4>
              <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                Connect node pins visually, verify DRC warnings, and simulate firmware logic safely.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 hover:border-amber-300 dark:hover:border-amber-800/60 transition-all shadow-xs">
              <span className="inline-block rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-700 dark:border-amber-800/80 dark:bg-amber-950/40 dark:text-amber-300">
                03. Physical Build
              </span>
              <h4 className="mt-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Assembly &amp; Flash
              </h4>
              <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                Follow step-by-step instructions and flash generated firmware to physical MCU.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 hover:border-rose-300 dark:hover:border-rose-800/60 transition-all shadow-xs">
              <span className="inline-block rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-700 dark:border-rose-800/80 dark:bg-rose-950/40 dark:text-rose-300">
                04. Diagnosis
              </span>
              <h4 className="mt-2 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Circuit Doctor
              </h4>
              <p className="mt-1 text-[11px] text-zinc-500 leading-relaxed">
                Photograph malfunctioning hardware to isolate faulty wires or rail inversions.
              </p>
            </div>
          </div>
        </section>

        {/* Clean Footer */}
        <footer className="pt-8 pb-4 border-t border-zinc-200 text-center text-xs text-zinc-400 font-mono dark:border-zinc-800">
          CircuitDoctor AI Suite • Engineered with Google Gemma &amp; PostgreSQL
        </footer>
      </main>
    </div>
  );
}
