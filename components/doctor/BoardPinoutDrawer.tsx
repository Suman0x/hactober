"use client";

import React, { useState } from "react";
import { X, Search, Cpu, AlertTriangle, ShieldCheck, ExternalLink, Zap, Info } from "lucide-react";

interface BoardPinoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BoardData {
  id: string;
  name: string;
  architecture: string;
  voltage: string;
  logicLevel: string;
  maxCurrentPerPin: string;
  flash: string;
  warningNotice: string;
  pins: Array<{
    pin: string;
    label: string;
    functions: string[];
    note?: string;
  }>;
}

const BOARDS: BoardData[] = [
  {
    id: "esp32",
    name: "ESP32 (NodeMCU / WROOM-32)",
    architecture: "Xtensa Dual-Core 32-bit @ 240MHz",
    voltage: "5V via Micro-USB / VIN, or 3.3V regulated",
    logicLevel: "3.3V (NOT 5V tolerant!)",
    maxCurrentPerPin: "12 - 40 mA (recommended <= 20mA)",
    flash: "4MB SPI Flash + 520KB SRAM",
    warningNotice:
      "CRITICAL: ESP32 GPIOs are NOT 5V tolerant! Applying 5V directly to any GPIO will cause permanent silicon breakdown. Also note: ADC2 pins (GPIO 0, 2, 4, 12-15, 25-27) fail when WiFi is transmitting.",
    pins: [
      { pin: "3V3", label: "3.3V Output", functions: ["Power"], note: "Max ~500mA from on-board LDO" },
      { pin: "GND", label: "Ground", functions: ["Ground"] },
      { pin: "GPIO 21", label: "D21 / SDA", functions: ["I2C", "GPIO"], note: "Default Wire SDA" },
      { pin: "GPIO 22", label: "D22 / SCL", functions: ["I2C", "GPIO"], note: "Default Wire SCL" },
      { pin: "GPIO 34", label: "ADC1_CH6", functions: ["ADC", "Input-Only"], note: "No internal pull-up/down" },
      { pin: "GPIO 35", label: "ADC1_CH7", functions: ["ADC", "Input-Only"], note: "No internal pull-up/down" },
      { pin: "GPIO 36", label: "VP / ADC1_CH0", functions: ["ADC", "Input-Only"], note: "No internal pull-up/down" },
      { pin: "GPIO 39", label: "VN / ADC1_CH3", functions: ["ADC", "Input-Only"], note: "No internal pull-up/down" },
      { pin: "GPIO 2", label: "D2 / LED", functions: ["GPIO", "PWM", "ADC2"], note: "Strapping pin - must be LOW for boot" },
      { pin: "GPIO 0", label: "BOOT", functions: ["GPIO", "ADC2"], note: "Pull LOW to enter UART flash download mode" },
      { pin: "GPIO 1", label: "TX0", functions: ["UART", "Debug"], note: "Hardware Serial TX" },
      { pin: "GPIO 3", label: "RX0", functions: ["UART", "Debug"], note: "Hardware Serial RX" },
      { pin: "GPIO 18", label: "D18 / SCK", functions: ["SPI", "GPIO"], note: "VSPI Clock" },
      { pin: "GPIO 19", label: "D19 / MISO", functions: ["SPI", "GPIO"], note: "VSPI MISO" },
      { pin: "GPIO 23", label: "D23 / MOSI", functions: ["SPI", "GPIO"], note: "VSPI MOSI" },
      { pin: "GPIO 5", label: "D5 / CS", functions: ["SPI", "GPIO"], note: "VSPI Chip Select" },
    ],
  },
  {
    id: "arduino-uno",
    name: "Arduino Uno R3",
    architecture: "ATmega328P 8-bit AVR @ 16MHz",
    voltage: "7-12V DC Barrel Jack / VIN, 5V via USB",
    logicLevel: "5.0V TTL Logic",
    maxCurrentPerPin: "20mA (absolute max 40mA)",
    flash: "32KB Flash (0.5KB bootloader) + 2KB SRAM",
    warningNotice:
      "Total current through VCC/GND pin must never exceed 200mA across all pins combined. Never drive inductive loads (solenoids, DC motors) directly from digital pins without a flyback diode and transistor/MOSFET.",
    pins: [
      { pin: "5V", label: "5V Regulated", functions: ["Power"], note: "Up to 500mA USB / 800mA regulator" },
      { pin: "3V3", label: "3.3V Regulated", functions: ["Power"], note: "Max 50mA limit on older FTDI boards, 150mA R3" },
      { pin: "GND", label: "Ground", functions: ["Ground"] },
      { pin: "D0", label: "RX", functions: ["UART", "GPIO"], note: "Connected to USB-Serial interface" },
      { pin: "D1", label: "TX", functions: ["UART", "GPIO"], note: "Connected to USB-Serial interface" },
      { pin: "D2", label: "INT0", functions: ["GPIO", "Interrupt"], note: "External Interrupt 0" },
      { pin: "D3", label: "INT1 ~", functions: ["GPIO", "PWM", "Interrupt"], note: "External Interrupt 1" },
      { pin: "D5", label: "PWM ~", functions: ["GPIO", "PWM"] },
      { pin: "D6", label: "PWM ~", functions: ["GPIO", "PWM"] },
      { pin: "D9", label: "PWM ~", functions: ["GPIO", "PWM"] },
      { pin: "D10", label: "SS / PWM ~", functions: ["GPIO", "PWM", "SPI"], note: "SPI Slave Select" },
      { pin: "D11", label: "MOSI / PWM ~", functions: ["GPIO", "PWM", "SPI"], note: "SPI Master Out" },
      { pin: "D12", label: "MISO", functions: ["GPIO", "SPI"], note: "SPI Master In" },
      { pin: "D13", label: "SCK / Built-in LED", functions: ["GPIO", "SPI", "LED"], note: "Has internal resistor + LED" },
      { pin: "A0", label: "Analog 0", functions: ["ADC", "GPIO"], note: "10-bit resolution (0-1023)" },
      { pin: "A4", label: "SDA / A4", functions: ["I2C", "ADC", "GPIO"], note: "Wire SDA pin" },
      { pin: "A5", label: "SCL / A5", functions: ["I2C", "ADC", "GPIO"], note: "Wire SCL pin" },
    ],
  },
  {
    id: "pico",
    name: "Raspberry Pi Pico (RP2040)",
    architecture: "Dual ARM Cortex-M0+ @ 133MHz",
    voltage: "1.8V to 5.5V via VSYS / 5V USB VBUS",
    logicLevel: "3.3V Logic (Strictly NOT 5V tolerant)",
    maxCurrentPerPin: "16mA (Programmable drive strength)",
    flash: "2MB QSPI Flash + 264KB on-chip SRAM",
    warningNotice:
      "Operates strictly at 3.3V. Using 5V logic sensors without bidirectional level shifters will damage the RP2040. ADC pins (GP26-28) have a known DNL glitch near ~0.7V on early revisions.",
    pins: [
      { pin: "GP0", label: "UART0 TX / I2C0 SDA", functions: ["UART", "I2C", "PWM", "GPIO"] },
      { pin: "GP1", label: "UART0 RX / I2C0 SCL", functions: ["UART", "I2C", "PWM", "GPIO"] },
      { pin: "GP4", label: "I2C0 SDA / SPI0 RX", functions: ["I2C", "SPI", "PWM", "GPIO"] },
      { pin: "GP5", label: "I2C0 SCL / SPI0 CSn", functions: ["I2C", "SPI", "PWM", "GPIO"] },
      { pin: "GP16", label: "SPI0 RX", functions: ["SPI", "PWM", "GPIO"] },
      { pin: "GP17", label: "SPI0 CSn", functions: ["SPI", "PWM", "GPIO"] },
      { pin: "GP18", label: "SPI0 SCK", functions: ["SPI", "PWM", "GPIO"] },
      { pin: "GP19", label: "SPI0 TX", functions: ["SPI", "PWM", "GPIO"] },
      { pin: "GP25", label: "Built-in LED", functions: ["GPIO", "LED"], note: "On non-W models. Pico W uses CYW43439" },
      { pin: "GP26", label: "ADC0", functions: ["ADC", "PWM", "GPIO"], note: "12-bit ADC (0-4095)" },
      { pin: "GP27", label: "ADC1", functions: ["ADC", "PWM", "GPIO"], note: "12-bit ADC" },
      { pin: "GP28", label: "ADC2", functions: ["ADC", "PWM", "GPIO"], note: "12-bit ADC" },
      { pin: "VBUS", label: "5V USB Supply", functions: ["Power"], note: "Direct 5V supply from Micro-USB" },
      { pin: "3V3(OUT)", label: "3.3V Output", functions: ["Power"], note: "Internal SMPS output up to 300mA" },
    ],
  },
  {
    id: "stm32",
    name: "STM32F103C8T6 (Blue Pill)",
    architecture: "ARM Cortex-M3 @ 72MHz",
    voltage: "3.3V or 5V (via onboard LDO)",
    logicLevel: "3.3V (Many pins are 5V tolerant, labeled FT)",
    maxCurrentPerPin: "25mA (total MCU max 150mA)",
    flash: "64KB (often 128KB) Flash + 20KB SRAM",
    warningNotice:
      "Analog pins (ADC) are NOT 5V tolerant even if nearby GPIOs are. Ensure BOOT0 is set to 0 for normal operation, or set to 1 to flash via USART1 bootloader. Check for correct 1.5kΩ pull-up resistor on USB D+ line.",
    pins: [
      { pin: "PA0", label: "WKUP / ADC12_IN0", functions: ["ADC", "GPIO", "Timer"], note: "Wakeup pin, NOT 5V tolerant" },
      { pin: "PA9", label: "USART1_TX", functions: ["UART", "PWM", "GPIO"], note: "5V Tolerant" },
      { pin: "PA10", label: "USART1_RX", functions: ["UART", "PWM", "GPIO"], note: "5V Tolerant" },
      { pin: "PB6", label: "I2C1_SCL", functions: ["I2C", "PWM", "GPIO"], note: "5V Tolerant" },
      { pin: "PB7", label: "I2C1_SDA", functions: ["I2C", "PWM", "GPIO"], note: "5V Tolerant" },
      { pin: "PB10", label: "I2C2_SCL", functions: ["I2C", "PWM", "GPIO"], note: "5V Tolerant" },
      { pin: "PB11", label: "I2C2_SDA", functions: ["I2C", "PWM", "GPIO"], note: "5V Tolerant" },
      { pin: "PC13", label: "Built-in LED (Active LOW)", functions: ["GPIO", "LED"], note: "Inverted LED logic" },
      { pin: "3.3V", label: "3.3V Regulated", functions: ["Power"], note: "Onboard RT9193 regulator" },
      { pin: "GND", label: "Ground", functions: ["Ground"] },
    ],
  },
];

export function BoardPinoutDrawer({ isOpen, onClose }: BoardPinoutDrawerProps) {
  const [selectedBoardId, setSelectedBoardId] = useState<string>("esp32");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterFunction, setFilterFunction] = useState<string>("ALL");

  if (!isOpen) return null;

  const currentBoard = BOARDS.find((b) => b.id === selectedBoardId) || BOARDS[0];

  const filteredPins = currentBoard.pins.filter((p) => {
    const matchesSearch =
      p.pin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.functions.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.note && p.note.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter =
      filterFunction === "ALL" ||
      p.functions.some((f) => f.toUpperCase() === filterFunction);

    return matchesSearch && matchesFilter;
  });

  const getFunctionBadge = (func: string) => {
    switch (func.toUpperCase()) {
      case "POWER":
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      case "GROUND":
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
      case "I2C":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "SPI":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "UART":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "ADC":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "PWM":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl shadow-cyan-950/20 text-zinc-100">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Board Pinout Quick Reference
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300">
                  Hardware Specs
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Verified hardware pin mapping & electrical threshold safeguards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Board Selector Tabs */}
        <div className="p-3 bg-zinc-900/40 border-b border-zinc-800 flex gap-1.5 overflow-x-auto no-scrollbar">
          {BOARDS.map((board) => (
            <button
              key={board.id}
              onClick={() => {
                setSelectedBoardId(board.id);
                setSearchQuery("");
                setFilterFunction("ALL");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedBoardId === board.id
                  ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              {board.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Board Specs Card */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/20 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">{currentBoard.name}</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{currentBoard.architecture}</p>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                ⚡ Logic: {currentBoard.logicLevel}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                🔌 Input: {currentBoard.voltage}
              </span>
            </div>
          </div>

          {/* Critical Hardware Warning */}
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-amber-300">Safety & Spec Guardrail: </span>
              {currentBoard.warningNotice}
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-3 border-b border-zinc-800 flex flex-wrap items-center gap-2 bg-zinc-950">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search pin, function (I2C, SDA, ADC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {["ALL", "I2C", "SPI", "ADC", "PWM", "UART", "POWER"].map((fn) => (
              <button
                key={fn}
                onClick={() => setFilterFunction(fn)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  filterFunction === fn
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                {fn}
              </button>
            ))}
          </div>
        </div>

        {/* Pinout List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredPins.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No pins matching &quot;{searchQuery}&quot; found for {currentBoard.name}.
            </div>
          ) : (
            filteredPins.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 shrink-0 font-mono font-bold text-xs text-cyan-400 group-hover:text-cyan-300 transition-colors">
                    {item.pin}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 truncate">
                      {item.label}
                    </div>
                    {item.note && (
                      <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                        <Info className="w-3 h-3 text-zinc-500 shrink-0" />
                        {item.note}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.functions.map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getFunctionBadge(
                        f
                      )}`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/60 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Always verify with physical IC datasheet before powering up.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
