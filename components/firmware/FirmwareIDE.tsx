"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FileCode,
  Play,
  Save,
  Copy,
  Check,
  Download,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Plus,
  Trash2,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Radio,
  FileCheck,
  Maximize2,
  Minimize2,
  Terminal,
  Layers,
  Info,
  Clock,
  Settings,
  ExternalLink,
  Search,
  Replace,
  X,
  Wand2,
  Sliders,
  Share2,
  FolderGit2,
  Hash,
  Send,
  Eye,
  Activity,
  CircleAlert,
  HelpCircle,
  FileText,
  CornerDownRight,
  ShieldCheck,
  HardDrive,
} from "lucide-react";
import {
  analyzeFirmware,
  extractPinsFromCode,
  generatePinHeader,
  generatePlatformIoIni,
  ExtractedPin,
  FirmwareAnalysisResult,
} from "@/lib/analysis/firmware";
import { tokenizeLine, getTokenClass } from "./FirmwareSyntax";

interface FirmwareIDEProps {
  projectId: string;
  projectName?: string;
  initialCode: string;
  circuitConnections?: any[];
  onSave: (filename: string, code: string) => Promise<boolean | void>;
  onSwitchToCircuitTab?: () => void;
  className?: string;
}

interface IDEFile {
  name: string;
  content: string;
  isModified?: boolean;
  isReadOnly?: boolean;
}

interface BoardProfile {
  id: string;
  label: string;
  mcu: string;
  freq: string;
  flash: string;
  sram: string;
  voltage: string;
  maxFlashBytes: number;
  maxSramBytes: number;
}

const BOARD_OPTIONS: BoardProfile[] = [
  {
    id: "esp32",
    label: "ESP32 DevKit (WROOM-32)",
    mcu: "Xtensa Dual-Core LX6",
    freq: "240 MHz",
    flash: "4 MB Flash",
    sram: "520 KB SRAM",
    voltage: "3.3V Logic",
    maxFlashBytes: 4194304,
    maxSramBytes: 532480,
  },
  {
    id: "uno",
    label: "Arduino Uno (ATmega328P)",
    mcu: "ATmega328P 8-bit AVR",
    freq: "16 MHz",
    flash: "32 KB Flash",
    sram: "2 KB SRAM",
    voltage: "5.0V Logic",
    maxFlashBytes: 32256,
    maxSramBytes: 2048,
  },
  {
    id: "nano",
    label: "Arduino Nano (ATmega328P)",
    mcu: "ATmega328P 8-bit AVR",
    freq: "16 MHz",
    flash: "32 KB Flash",
    sram: "2 KB SRAM",
    voltage: "5.0V Logic",
    maxFlashBytes: 30720,
    maxSramBytes: 2048,
  },
  {
    id: "pico",
    label: "Raspberry Pi Pico (RP2040)",
    mcu: "Dual ARM Cortex-M0+",
    freq: "133 MHz",
    flash: "2 MB Flash",
    sram: "264 KB SRAM",
    voltage: "3.3V Logic",
    maxFlashBytes: 2097152,
    maxSramBytes: 270336,
  },
  {
    id: "nodemcu",
    label: "ESP8266 NodeMCU (ESP-12E)",
    mcu: "Tensilica L106 32-bit",
    freq: "80 MHz",
    flash: "4 MB Flash",
    sram: "80 KB SRAM",
    voltage: "3.3V Logic",
    maxFlashBytes: 4194304,
    maxSramBytes: 81920,
  },
];

const SNIPPET_TEMPLATES = [
  {
    title: "Heartbeat / Blink LED",
    description: "Classic blinking heartbeat LED on standard pin 13",
    code: `// Heartbeat LED
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(100);
  digitalWrite(LED_PIN, LOW);
  delay(900);
}
`,
  },
  {
    title: "Non-Blocking Millis() Scheduler",
    description: "Multi-tasking loop execution without blocking delays",
    code: `// Non-blocking timer task using millis()
unsigned long lastHeartbeat = 0;
const unsigned long INTERVAL_MS = 1000;
bool ledState = false;

void setup() {
  Serial.begin(115200);
  pinMode(13, OUTPUT);
  Serial.println("Non-blocking scheduler initialized.");
}

void loop() {
  unsigned long currentMillis = millis();

  if (currentMillis - lastHeartbeat >= INTERVAL_MS) {
    lastHeartbeat = currentMillis;
    ledState = !ledState;
    digitalWrite(13, ledState ? HIGH : LOW);
    Serial.print("Tick at ms: ");
    Serial.println(currentMillis);
  }

  // Other sensors can execute here without being blocked!
}
`,
  },
  {
    title: "Analog Sensor Moving Average Filter",
    description: "Reads ADC pin A0 and averages 10 samples to eliminate noise",
    code: `// Analog Sensor with 10-sample moving average filter
const int SENSOR_PIN = A0;
const int NUM_READINGS = 10;
int readings[NUM_READINGS];
int readIndex = 0;
long total = 0;

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);
  for (int i = 0; i < NUM_READINGS; i++) readings[i] = 0;
}

void loop() {
  total = total - readings[readIndex];
  readings[readIndex] = analogRead(SENSOR_PIN);
  total = total + readings[readIndex];
  readIndex = (readIndex + 1) % NUM_READINGS;

  int average = total / NUM_READINGS;
  Serial.print("Smoothed ADC: ");
  Serial.println(average);
  delay(50);
}
`,
  },
  {
    title: "I2C Bus Scanner",
    description: "Scans standard Wire I2C addresses (0x01 to 0x7E)",
    code: `#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(115200);
  while (!Serial);
  Serial.println("\\n--- I2C Bus Scanner ---");
}

void loop() {
  byte count = 0;
  for (byte address = 1; address < 127; ++address) {
    Wire.beginTransmission(address);
    if (Wire.endTransmission() == 0) {
      Serial.print("I2C device found at address 0x");
      if (address < 16) Serial.print("0");
      Serial.println(address, HEX);
      count++;
    }
  }
  if (count == 0) Serial.println("No I2C devices attached.\\n");
  delay(5000);
}
`,
  },
  {
    title: "ESP32 WiFi Station Boilerplate",
    description: "Connects to WiFi network and prints assigned IP",
    code: `#include <WiFi.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Application telemetry payload
  delay(1000);
}
`,
  },
  {
    title: "Debounced Button Input Handler",
    description: "Hardware button reading with software glitch filtering",
    code: `// Button debounce state machine
const int BUTTON_PIN = 2;
const int LED_PIN = 13;

int buttonState;
int lastButtonState = LOW;
unsigned long lastDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY_MS = 50;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int reading = digitalRead(BUTTON_PIN);
  if (reading != lastButtonState) {
    lastDebounceTime = millis();
  }

  if ((millis() - lastDebounceTime) > DEBOUNCE_DELAY_MS) {
    if (reading != buttonState) {
      buttonState = reading;
      if (buttonState == LOW) { // Pressed (pull-up)
        Serial.println("Button Clicked!");
        digitalWrite(LED_PIN, !digitalRead(LED_PIN));
      }
    }
  }
  lastButtonState = reading;
}
`,
  },
];

export function FirmwareIDE({
  projectId,
  projectName = "Embedded Project",
  initialCode,
  circuitConnections = [],
  onSave,
  onSwitchToCircuitTab,
  className = "",
}: FirmwareIDEProps) {
  // File System State
  const [files, setFiles] = useState<IDEFile[]>([
    {
      name: "main.ino",
      content:
        initialCode ||
        `// CircuitDoctor Firmware Project
void setup() {
  Serial.begin(115200);
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
`,
      isModified: false,
    },
    {
      name: "config.h",
      content: generatePinHeader(circuitConnections),
      isModified: false,
    },
    {
      name: "secrets.h",
      content: `// Hardware credentials & network configuration
#ifndef SECRETS_H
#define SECRETS_H

#define WIFI_SSID     "WIFI_NETWORK_NAME"
#define WIFI_PASS     "SUPER_SECRET_KEY"
#define TELEMETRY_KEY "cd_live_token_default"

#endif
`,
      isModified: false,
    },
  ]);

  const [activeFileName, setActiveFileName] = useState<string>("main.ino");
  const [selectedBoardId, setSelectedBoardId] = useState<string>("esp32");

  // IDE Controls & State
  const [isSaving, setIsSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"diagnostics" | "pins" | "platformio">("diagnostics");
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [fontSize, setFontSize] = useState<number>(13);
  const [wordWrap, setWordWrap] = useState<boolean>(false);
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());

  // Search & Replace State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [searchMatchIndices, setSearchMatchIndices] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Bottom Console / Terminal Panel State
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleTab, setConsoleTab] = useState<"build" | "serial" | "problems">("build");
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStatus, setCompileStatus] = useState<"idle" | "success" | "error">("idle");
  const [buildLogs, setBuildLogs] = useState<string[]>([
    "CircuitDoctor Firmware Toolchain v2.4.0 initialized.",
    "Ready to compile or run static analysis.",
  ]);

  // Serial Monitor Simulation State
  const [serialBaud, setSerialBaud] = useState<number>(115200);
  const [serialLogs, setSerialLogs] = useState<
    { id: string; time: string; tag: string; text: string }[]
  >([
    {
      id: "1",
      time: "00:00:01.200",
      tag: "BOOT",
      text: "Device core booting: Xtensa dual-core 240MHz",
    },
    {
      id: "2",
      time: "00:00:01.320",
      tag: "INIT",
      text: "Serial UART stream initialized at 115200 baud.",
    },
  ]);
  const [serialCommand, setSerialCommand] = useState("");
  const [autoScrollSerial, setAutoScrollSerial] = useState(true);

  // UI Dropdowns
  const [showSnippetsMenu, setShowSnippetsMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileNameInput, setNewFileNameInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const codeBackdropRef = useRef<HTMLDivElement>(null);
  const serialEndRef = useRef<HTMLDivElement>(null);

  // Active board profile
  const activeBoard = useMemo(() => {
    return BOARD_OPTIONS.find((b) => b.id === selectedBoardId) || BOARD_OPTIONS[0];
  }, [selectedBoardId]);

  // Active file pointer
  const activeFile = useMemo(() => {
    return files.find((f) => f.name === activeFileName) || files[0];
  }, [files, activeFileName]);

  // Main code for static analysis
  const mainFile = useMemo(() => {
    return files.find((f) => f.name === "main.ino") || files[0];
  }, [files]);

  // Perform static firmware analysis
  const analysis: FirmwareAnalysisResult = useMemo(() => {
    return analyzeFirmware(mainFile.content);
  }, [mainFile.content]);

  // Sync initialCode prop updates if received from parent
  useEffect(() => {
    if (initialCode && files[0]?.name === "main.ino" && !files[0]?.content.trim()) {
      const timer = setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) => (f.name === "main.ino" ? { ...f, content: initialCode, isModified: false } : f))
        );
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialCode, files]);

  // Handle textarea text change
  const handleContentChange = (newVal: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.name === activeFileName ? { ...f, content: newVal, isModified: true } : f))
    );
    setSaveSuccess(false);
    setCompileStatus("idle");
  };

  // Synchronize scroll between gutter, textarea, and backdrop code
  const handleScroll = () => {
    if (textareaRef.current) {
      const top = textareaRef.current.scrollTop;
      const left = textareaRef.current.scrollLeft;
      if (gutterRef.current) gutterRef.current.scrollTop = top;
      if (codeBackdropRef.current) {
        codeBackdropRef.current.scrollTop = top;
        codeBackdropRef.current.scrollLeft = left;
      }
    }
  };

  // Track cursor position & detect current scope
  const handleCursorMove = () => {
    if (!textareaRef.current) return;
    const { selectionStart, value } = textareaRef.current;
    const textUpToCursor = value.substring(0, selectionStart);
    const lines = textUpToCursor.split("\n");
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Detect current function scope
  const currentScope = useMemo(() => {
    const lines = activeFile.content.split("\n");
    const currentLineIndex = cursorPos.line - 1;
    let foundFunction = "global";

    for (let i = currentLineIndex; i >= 0; i--) {
      const line = lines[i].trim();
      const fnMatch = line.match(/(?:void|int|bool|float|String)\s+([A-Za-z0-9_]+)\s*\(/);
      if (fnMatch) {
        foundFunction = `${fnMatch[1]}()`;
        break;
      }
    }
    return foundFunction;
  }, [activeFile.content, cursorPos.line]);

  // Keyboard shortcut & indentation handling
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save: Ctrl+S / Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      handleSave();
      return;
    }

    // Search: Ctrl+F / Cmd+F
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
      e.preventDefault();
      setIsSearchOpen(true);
      return;
    }

    // Compile: Ctrl+Enter / Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleCompile();
      return;
    }

    // Toggle comment: Ctrl+/ or Cmd+/
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      toggleLineComment();
      return;
    }

    // Tab key indentation
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      if (!e.shiftKey) {
        // Insert 2 spaces
        const newVal = val.substring(0, start) + "  " + val.substring(end);
        handleContentChange(newVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      } else {
        // Shift+Tab: Unindent current line
        const lineStart = val.lastIndexOf("\n", start - 1) + 1;
        if (val.substring(lineStart, lineStart + 2) === "  ") {
          const newVal = val.substring(0, lineStart) + val.substring(lineStart + 2);
          handleContentChange(newVal);
          setTimeout(() => {
            textarea.selectionStart = Math.max(lineStart, start - 2);
            textarea.selectionEnd = Math.max(lineStart, end - 2);
          }, 0);
        }
      }
    }
  };

  // Toggle comment on current or selected lines
  const toggleLineComment = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    let lineEnd = value.indexOf("\n", selectionEnd);
    if (lineEnd === -1) lineEnd = value.length;

    const selectedLines = value.substring(lineStart, lineEnd).split("\n");
    const allCommented = selectedLines.every((l) => l.trimStart().startsWith("//"));

    const newLines = selectedLines.map((l) => {
      if (allCommented) {
        return l.replace(/^\s*\/\/\s?/, "");
      } else {
        return "// " + l;
      }
    });

    const replaced = newLines.join("\n");
    const newVal = value.substring(0, lineStart) + replaced + value.substring(lineEnd);
    handleContentChange(newVal);
  };

  // Auto-Format Code (Prettify)
  const handleFormatCode = () => {
    const lines = activeFile.content.split("\n");
    let indentLevel = 0;
    const formatted: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        formatted.push("");
        return;
      }

      // Preprocessor lines keep zero indentation
      if (trimmed.startsWith("#")) {
        formatted.push(trimmed);
        return;
      }

      // Decrease indent if line starts with closing brace
      if (trimmed.startsWith("}") || trimmed.startsWith(")")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indentStr = "  ".repeat(indentLevel);
      formatted.push(indentStr + trimmed);

      // Increase indent if line ends with open brace
      if (trimmed.endsWith("{") || (trimmed.endsWith(":") && !trimmed.startsWith("default:"))) {
        indentLevel++;
      }
      // If line contains both { and }, adjust
      const openCount = (trimmed.match(/{/g) || []).length;
      const closeCount = (trimmed.match(/}/g) || []).length;
      if (openCount !== closeCount && !trimmed.endsWith("{") && !trimmed.startsWith("}")) {
        indentLevel += openCount - closeCount;
        if (indentLevel < 0) indentLevel = 0;
      }
    });

    handleContentChange(formatted.join("\n"));
  };

  // Save active firmware code
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onSave(activeFile.name, activeFile.content);
      setFiles((prev) =>
        prev.map((f) => (f.name === activeFile.name ? { ...f, isModified: false } : f))
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Compile / Verify Simulation
  const handleCompile = () => {
    setIsCompiling(true);
    setCompileStatus("idle");
    setConsoleTab("build");
    setIsConsoleOpen(true);

    const now = new Date().toLocaleTimeString();
    setBuildLogs([
      `[${now}] Compiling firmware for board: ${activeBoard.label}...`,
      `Toolchain: xtensa-esp32-elf-g++ -Os -Wall -Wextra -ffunction-sections`,
      `Source: ${activeFile.name} (Lines: ${activeFile.content.split("\n").length})`,
    ]);

    setTimeout(() => {
      // Check for syntax issues
      const hasMissingSetup = !activeFile.content.includes("setup");
      const hasMissingLoop = !activeFile.content.includes("loop");

      const flashUsage = Math.min(
        Math.floor(activeFile.content.length * 42 + 2800),
        activeBoard.maxFlashBytes
      );
      const sramUsage = Math.min(
        Math.floor(activeFile.content.length * 3 + 320),
        activeBoard.maxSramBytes
      );

      const flashPct = ((flashUsage / activeBoard.maxFlashBytes) * 100).toFixed(1);
      const sramPct = ((sramUsage / activeBoard.maxSramBytes) * 100).toFixed(1);

      if (hasMissingSetup || hasMissingLoop) {
        setCompileStatus("error");
        setBuildLogs((prev) => [
          ...prev,
          `[ERROR] Compilation failed: Arduino sketch requires void setup() and void loop().`,
          `Linker exited with code 1.`,
        ]);
      } else {
        setCompileStatus("success");
        setBuildLogs((prev) => [
          ...prev,
          `[BUILD] Object files compiled cleanly.`,
          `[LINK] Linking firmware.elf and generating firmware.bin...`,
          `[SIZE] Program storage space: ${flashUsage.toLocaleString()} bytes (${flashPct}% of ${activeBoard.maxFlashBytes.toLocaleString()} bytes)`,
          `[SIZE] Dynamic memory: ${sramUsage.toLocaleString()} bytes (${sramPct}% of ${activeBoard.maxSramBytes.toLocaleString()} bytes)`,
          `✓ SUCCESS: Firmware compiled successfully (Build time: 0.28s).`,
        ]);
      }
      setIsCompiling(false);
    }, 600);
  };

  // Serial Monitor: Send command
  const handleSendSerialCommand = () => {
    if (!serialCommand.trim()) return;
    const cmd = serialCommand.trim();
    const now = new Date().toLocaleTimeString();

    setSerialLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        time: now,
        tag: "TX",
        text: `> ${cmd}`,
      },
    ]);

    setSerialCommand("");

    // Simulate microcontroller response
    setTimeout(() => {
      let resp = `Command '${cmd}' received (ACK).`;
      if (cmd.toUpperCase() === "PING") resp = "PONG! Hardware live.";
      if (cmd.toUpperCase() === "STATUS")
        resp = `Device OK. Active Baud: ${serialBaud}, Memory Heap: 284KB free.`;
      if (cmd.toUpperCase() === "RESET") resp = "Soft CPU reset acknowledged. Booting...";

      setSerialLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString(),
          tag: "RX",
          text: resp,
        },
      ]);
    }, 300);
  };

  // Jump cursor directly to line
  const handleJumpToLine = (targetLine: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lines = activeFile.content.split("\n");
    let charIndex = 0;
    for (let i = 0; i < Math.min(targetLine - 1, lines.length); i++) {
      charIndex += lines[i].length + 1;
    }

    textarea.focus();
    textarea.selectionStart = charIndex;
    textarea.selectionEnd = charIndex + (lines[targetLine - 1]?.length || 0);

    // Scroll gutter & textarea to center line
    const lineHeight = 24;
    textarea.scrollTop = Math.max(0, (targetLine - 5) * lineHeight);
    handleCursorMove();
  };

  // Convert delay to millis auto-fix
  const handleFixDelay = (lineNum: number) => {
    const lines = activeFile.content.split("\n");
    const targetIdx = lineNum - 1;
    if (lines[targetIdx] && lines[targetIdx].includes("delay(")) {
      lines[targetIdx] = `  // [Optimized] Replaced blocking delay with non-blocking check
  static unsigned long lastTick = 0;
  if (millis() - lastTick >= 500) {
    lastTick = millis();
    // Non-blocking timer task branch
  }`;
      handleContentChange(lines.join("\n"));
    }
  };

  // Copy code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Download active file
  const handleDownloadFile = () => {
    const blob = new Blob([activeFile.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Download platformio.ini
  const handleDownloadPlatformIo = () => {
    const iniContent = generatePlatformIoIni(selectedBoardId, analysis.baudRate || 115200);
    const blob = new Blob([iniContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platformio.ini";
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // Insert code snippet
  const handleInsertSnippet = (snippetCode: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;

    const newVal = val.substring(0, start) + "\n" + snippetCode + "\n" + val.substring(end);
    handleContentChange(newVal);
    setShowSnippetsMenu(false);
  };

  // Sync pins from circuit connections
  const handleSyncPinsFromCircuit = () => {
    const pinHeader = generatePinHeader(circuitConnections);
    setFiles((prev) => {
      const hasConfig = prev.some((f) => f.name === "config.h");
      if (hasConfig) {
        return prev.map((f) => (f.name === "config.h" ? { ...f, content: pinHeader, isModified: true } : f));
      }
      return [...prev, { name: "config.h", content: pinHeader, isModified: true }];
    });
    setActiveFileName("config.h");
  };

  // Add new file tab
  const handleCreateNewFile = () => {
    if (!newFileNameInput.trim()) return;
    const cleanName = newFileNameInput.trim();
    if (files.some((f) => f.name.toLowerCase() === cleanName.toLowerCase())) {
      alert("A file with this name already exists.");
      return;
    }

    const macroName = cleanName.replace(/[^A-Za-z0-9]/g, "_").toUpperCase();
    const isHeader = cleanName.endsWith(".h");
    const defaultContent = isHeader
      ? `// ${cleanName}\n#ifndef ${macroName}\n#define ${macroName}\n\n#include <Arduino.h>\n\n// Module declarations\n\n#endif // ${macroName}\n`
      : `// ${cleanName}\n#include <Arduino.h>\n\n// Source definitions\n`;

    const newFile: IDEFile = {
      name: cleanName,
      content: defaultContent,
      isModified: true,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileName(cleanName);
    setShowNewFileModal(false);
    setNewFileNameInput("");
  };

  // Close custom file tab
  const handleCloseFile = (fileNameToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileNameToClose === "main.ino") return;
    setFiles((prev) => prev.filter((f) => f.name !== fileNameToClose));
    if (activeFileName === fileNameToClose) {
      setActiveFileName("main.ino");
    }
  };

  // Toggle Breakpoint on gutter
  const handleToggleBreakpoint = (lineNum: number) => {
    setBreakpoints((prev) => {
      const next = new Set(prev);
      if (next.has(lineNum)) next.delete(lineNum);
      else next.add(lineNum);
      return next;
    });
  };

  // Compute active lines
  const activeLines = useMemo(() => {
    return activeFile.content.split("\n");
  }, [activeFile.content]);

  // Warning lines map for gutter markers
  const warningLinesSet = useMemo(() => {
    const set = new Set<number>();
    if (activeFileName === "main.ino") {
      analysis.blockingDelays.forEach((d) => set.add(d.line));
    }
    return set;
  }, [analysis.blockingDelays, activeFileName]);

  // Pre-tokenize lines for syntax backdrop
  const tokenizedLines = useMemo(() => {
    const list = [];
    let inBlockComment = false;
    for (let i = 0; i < activeLines.length; i++) {
      const result = tokenizeLine(activeLines[i], inBlockComment);
      inBlockComment = result.endsInBlockComment;
      list.push(result.tokens);
    }
    return list;
  }, [activeLines]);

  // Search logic
  const handleExecuteSearch = (direction: "next" | "prev") => {
    if (!searchQuery) return;
    const content = activeFile.content;
    const regex = new RegExp(searchQuery, matchCase ? "g" : "gi");
    const matches: number[] = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push(match.index);
    }
    setSearchMatchIndices(matches);

    if (matches.length === 0) return;

    let nextIdx = currentMatchIndex;
    if (direction === "next") {
      nextIdx = (currentMatchIndex + 1) % matches.length;
    } else {
      nextIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    }
    setCurrentMatchIndex(nextIdx);

    const matchChar = matches[nextIdx];
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.selectionStart = matchChar;
      textarea.selectionEnd = matchChar + searchQuery.length;
      handleCursorMove();
    }
  };

  const handleReplaceOne = () => {
    if (!searchQuery || searchMatchIndices.length === 0) return;
    const matchChar = searchMatchIndices[currentMatchIndex];
    const val = activeFile.content;
    const newVal =
      val.substring(0, matchChar) + replaceQuery + val.substring(matchChar + searchQuery.length);
    handleContentChange(newVal);
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const regex = new RegExp(searchQuery, matchCase ? "g" : "gi");
    const newVal = activeFile.content.replace(regex, replaceQuery);
    handleContentChange(newVal);
  };

  // Auto-scroll serial log
  useEffect(() => {
    if (autoScrollSerial) {
      serialEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [serialLogs, autoScrollSerial]);

  return (
    <div
      className={`flex flex-col h-full w-full bg-[#090b10] text-zinc-100 select-none overflow-hidden font-sans border border-zinc-800/80 shadow-2xl rounded-lg ${className}`}
    >
      {/* =========================================================================
          Top IDE Header & Master Toolbar
         ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800/90 bg-[#0e121a] px-3 py-1.5 gap-2 shrink-0 select-none">
        {/* Left: Project Brand + File Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-0.5 no-scrollbar">
          {/* Micro Project Pill */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-cyan-950/40 border border-cyan-800/50 text-cyan-300 text-xs font-mono font-bold mr-1 shrink-0">
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">IDE:</span>
            <span className="text-zinc-200">{projectName || "Firmware"}</span>
          </div>

          {/* File Tabs */}
          <div className="flex items-center gap-1">
            {files.map((file) => {
              const isActive = file.name === activeFileName;
              const isHeader = file.name.endsWith(".h");
              const isCpp = file.name.endsWith(".cpp");
              const isIni = file.name.endsWith(".ini");

              return (
                <div
                  key={file.name}
                  onClick={() => setActiveFileName(file.name)}
                  className={`group relative flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono transition-all cursor-pointer border ${
                    isActive
                      ? "bg-[#181d28] text-cyan-300 border-cyan-700/60 shadow-xs font-semibold"
                      : "text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-zinc-200"
                  }`}
                >
                  <FileCode
                    className={`h-3.5 w-3.5 ${
                      isHeader
                        ? "text-blue-400"
                        : isCpp
                        ? "text-purple-400"
                        : isIni
                        ? "text-amber-400"
                        : "text-cyan-400"
                    }`}
                  />
                  <span>{file.name}</span>

                  {/* Modified Unsaved Dot */}
                  {file.isModified && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"
                      title="Unsaved changes"
                    />
                  )}

                  {file.name !== "main.ino" && (
                    <button
                      onClick={(e) => handleCloseFile(file.name, e)}
                      className="opacity-0 group-hover:opacity-100 ml-1 hover:text-rose-400 text-zinc-500 rounded p-0.5 transition-opacity"
                      title="Close file"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add File Button */}
            <button
              onClick={() => setShowNewFileModal(true)}
              className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/60 rounded transition-colors"
              title="Create new header or source file"
            >
              <Plus className="h-3 w-3" />
              <span className="text-[11px] font-mono hidden md:inline">New File</span>
            </button>
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Target Board Selector */}
          <div className="relative">
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="appearance-none bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 rounded px-2.5 py-1 pr-6 text-[11px] font-mono text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer shadow-xs"
            >
              {BOARD_OPTIONS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 absolute right-1.5 top-2 pointer-events-none text-zinc-400" />
          </div>

          {/* Verify & Compile Button */}
          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-mono font-semibold transition-all border ${
              isCompiling
                ? "bg-amber-950/40 text-amber-300 border-amber-800/60 animate-pulse"
                : compileStatus === "success"
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/40"
                : compileStatus === "error"
                ? "bg-rose-950/40 text-rose-300 border-rose-700/60 hover:bg-rose-900/40"
                : "bg-zinc-900 text-cyan-300 border-cyan-800/50 hover:bg-cyan-950/50 hover:border-cyan-600"
            }`}
            title="Verify & compile sketch syntax (Ctrl+Enter)"
          >
            {isCompiling ? (
              <RefreshCw className="h-3 w-3 animate-spin text-amber-400" />
            ) : compileStatus === "success" ? (
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            ) : (
              <ShieldCheck className="h-3 w-3 text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {isCompiling ? "Compiling..." : compileStatus === "success" ? "Compiled" : "Verify"}
            </span>
          </button>

          {/* Format Code */}
          <button
            onClick={handleFormatCode}
            className="flex items-center gap-1 rounded border border-zinc-700/70 bg-zinc-900 px-2 py-1 text-[11px] font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Auto-format code indentation (Shift+Alt+F)"
          >
            <Wand2 className="h-3 w-3 text-purple-400" />
            <span className="hidden md:inline">Format</span>
          </button>

          {/* Sync Pins from Circuit Studio */}
          <button
            onClick={handleSyncPinsFromCircuit}
            className="flex items-center gap-1 rounded border border-zinc-700/70 bg-zinc-900 px-2 py-1 text-[11px] font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            title="Generate C #define pin constants from Circuit Studio wire connections"
          >
            <Layers className="h-3 w-3 text-cyan-400" />
            <span className="hidden lg:inline">Sync Pins</span>
          </button>

          {/* Snippets Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSnippetsMenu(!showSnippetsMenu)}
              className="flex items-center gap-1 rounded border border-zinc-700/70 bg-zinc-900 px-2 py-1 text-[11px] font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Code2 className="h-3 w-3 text-amber-400" />
              <span className="hidden sm:inline">Snippets</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {showSnippetsMenu && (
              <div className="absolute right-0 mt-1 w-80 rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl z-50 p-2 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 flex justify-between items-center">
                  <span>Firmware Snippets</span>
                  <span className="text-zinc-600">Click to insert</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {SNIPPET_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleInsertSnippet(tmpl.code)}
                      className="w-full text-left p-2 rounded hover:bg-zinc-800 text-zinc-200 transition-colors group border border-transparent hover:border-zinc-700/50"
                    >
                      <div className="font-mono text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                        {tmpl.title}
                      </div>
                      <div className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">
                        {tmpl.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 rounded border border-zinc-700/70 bg-zinc-900 px-2 py-1 text-[11px] font-mono text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <Download className="h-3 w-3 text-zinc-400" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-3 w-3 text-zinc-500" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-56 rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl z-50 p-1 space-y-0.5 font-mono text-xs">
                <button
                  onClick={handleDownloadFile}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Download {activeFileName}</span>
                </button>
                <button
                  onClick={handleDownloadPlatformIo}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                >
                  <Settings className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download platformio.ini</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="w-full text-left px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"
                >
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Copy Code to Clipboard</span>
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-[11px] font-mono font-semibold transition-all ${
              saveSuccess
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm"
            }`}
          >
            {saveSuccess ? (
              <Check className="h-3.5 w-3.5 text-white" />
            ) : (
              <Save className={`h-3.5 w-3.5 ${isSaving ? "animate-spin" : ""}`} />
            )}
            <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save"}</span>
          </button>

          {/* Run in Simulator Button */}
          {onSwitchToCircuitTab && (
            <button
              onClick={onSwitchToCircuitTab}
              className="flex items-center gap-1.5 rounded bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 px-3 py-1 text-[11px] font-mono font-bold text-white shadow-sm transition-all"
              title="Test this firmware live in Circuit Studio simulator"
            >
              <Play className="h-3 w-3 fill-white" />
              <span className="hidden sm:inline">Simulator</span>
            </button>
          )}

          {/* Toggle Right Inspector */}
          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className={`p-1.5 rounded text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-700/60 ${
              isInspectorOpen ? "bg-zinc-800 text-cyan-300 border-cyan-800" : "bg-zinc-900"
            }`}
            title={isInspectorOpen ? "Hide Inspector Pane" : "Show Inspector Pane"}
          >
            <Sliders className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          Find & Replace Floating Overlay Bar
         ========================================================================= */}
      {isSearchOpen && (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-[#121620] px-3 py-1.5 text-xs font-mono gap-2 shrink-0 z-20">
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5">
              <Search className="h-3 w-3 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleExecuteSearch(e.shiftKey ? "prev" : "next");
                  if (e.key === "Escape") setIsSearchOpen(false);
                }}
                placeholder="Find in file..."
                className="bg-transparent text-zinc-200 focus:outline-none w-36 sm:w-48 text-[11px]"
                autoFocus
              />
              {searchMatchIndices.length > 0 && (
                <span className="text-[10px] text-zinc-400 px-1 bg-zinc-800 rounded">
                  {currentMatchIndex + 1}/{searchMatchIndices.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5">
              <Replace className="h-3 w-3 text-zinc-400" />
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="bg-transparent text-zinc-200 focus:outline-none w-36 sm:w-48 text-[11px]"
              />
            </div>

            {/* Match Case Toggle */}
            <button
              onClick={() => setMatchCase(!matchCase)}
              className={`px-1.5 py-0.5 rounded text-[10px] border ${
                matchCase ? "bg-cyan-900 text-cyan-200 border-cyan-700" : "text-zinc-400 border-zinc-700"
              }`}
              title="Match Case (Aa)"
            >
              Aa
            </button>

            {/* Next / Prev */}
            <button
              onClick={() => handleExecuteSearch("prev")}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300"
              title="Previous Match"
            >
              ▲
            </button>
            <button
              onClick={() => handleExecuteSearch("next")}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-300"
              title="Next Match"
            >
              ▼
            </button>

            {/* Replace / Replace All */}
            <button
              onClick={handleReplaceOne}
              className="px-2 py-0.5 hover:bg-zinc-800 rounded text-[11px] text-zinc-300 border border-zinc-700"
            >
              Replace
            </button>
            <button
              onClick={handleReplaceAll}
              className="px-2 py-0.5 hover:bg-zinc-800 rounded text-[11px] text-zinc-300 border border-zinc-700"
            >
              All
            </button>
          </div>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          Breadcrumb Scope Bar
         ========================================================================= */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-[#0b0e14] px-3 py-1 text-[11px] font-mono text-zinc-400 shrink-0">
        <div className="flex items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap">
          <FolderGit2 className="h-3 w-3 text-cyan-400" />
          <span className="text-zinc-500">firmware</span>
          <span className="text-zinc-600">/</span>
          <span className="text-zinc-300 font-semibold">{activeFile.name}</span>
          <span className="text-zinc-600">›</span>
          <span className="text-cyan-300 font-medium">{currentScope}</span>
        </div>

        {/* Quick controls: Font Size, Word Wrap, Search */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`px-1.5 py-0.5 rounded text-[10px] ${
              wordWrap ? "bg-cyan-950 text-cyan-300 border border-cyan-800" : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Toggle Word Wrap"
          >
            Wrap
          </button>

          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
            <button
              onClick={() => setFontSize(Math.max(11, fontSize - 1))}
              className="px-1 hover:text-zinc-300"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span>{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(18, fontSize + 1))}
              className="px-1 hover:text-zinc-300"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          <button
            onClick={() => setIsSearchOpen(true)}
            className="text-zinc-500 hover:text-zinc-300 p-0.5"
            title="Find (Ctrl+F)"
          >
            <Search className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          Main Editor Workspace & Inspector Split
         ========================================================================= */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Code Editor + Bottom Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d1017] overflow-hidden">
          {/* Code Editor Surface */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Synchronized Gutter Line Numbers & Breakpoints */}
            <div
              ref={gutterRef}
              className="w-12 bg-[#090c12] text-zinc-600 text-[11px] font-mono select-none py-3 px-1.5 text-right border-r border-zinc-800/80 overflow-hidden shrink-0 space-y-0"
              style={{ lineHeight: "24px" }}
            >
              {activeLines.map((_, index) => {
                const lineNum = index + 1;
                const isCurrent = cursorPos.line === lineNum;
                const hasWarning = warningLinesSet.has(lineNum);
                const hasBreakpoint = breakpoints.has(lineNum);

                return (
                  <div
                    key={lineNum}
                    onClick={() => handleToggleBreakpoint(lineNum)}
                    className={`flex items-center justify-end gap-1 cursor-pointer group ${
                      isCurrent ? "text-cyan-400 font-bold" : "hover:text-zinc-400"
                    }`}
                    style={{ height: "24px" }}
                    title={`Line ${lineNum} - Click to toggle breakpoint`}
                  >
                    {/* Breakpoint Dot */}
                    {hasBreakpoint ? (
                      <span className="h-2 w-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/80 shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500/0 group-hover:bg-rose-500/40 shrink-0" />
                    )}

                    {/* Warning Indicator */}
                    {hasWarning && (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" title="Blocking Delay Warning" />
                    )}

                    <span>{lineNum}</span>
                  </div>
                );
              })}
            </div>

            {/* Code Surface Container (Synchronized Backdrop + Editor) */}
            <div className="flex-1 relative overflow-hidden h-full">
              {/* Syntax Highlighted Backdrop */}
              <div
                ref={codeBackdropRef}
                className="absolute inset-0 pointer-events-none p-3 font-mono leading-6 overflow-hidden select-none"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: "24px",
                  whiteSpace: wordWrap ? "pre-wrap" : "pre",
                  tabSize: 2,
                }}
              >
                {tokenizedLines.map((tokens, lineIdx) => {
                  const lineNum = lineIdx + 1;
                  const isCurrent = cursorPos.line === lineNum;
                  return (
                    <div
                      key={lineIdx}
                      className={`min-h-[24px] ${isCurrent ? "bg-cyan-950/20 rounded-xs" : ""}`}
                    >
                      {tokens.map((token, tIdx) => (
                        <span key={tIdx} className={getTokenClass(token.type)}>
                          {token.text}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Native Typing Textarea Overlay */}
              <textarea
                ref={textareaRef}
                value={activeFile.content}
                onChange={(e) => handleContentChange(e.target.value)}
                onScroll={handleScroll}
                onKeyUp={handleCursorMove}
                onClick={handleCursorMove}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: "24px",
                  tabSize: 2,
                }}
                className={`absolute inset-0 h-full w-full bg-transparent text-transparent caret-cyan-400 p-3 font-mono leading-6 resize-none focus:outline-none selection:bg-cyan-600/30 selection:text-transparent overflow-auto whitespace-pre ${
                  wordWrap ? "whitespace-pre-wrap break-words" : "whitespace-pre"
                }`}
                placeholder="// Write Arduino C++ firmware code here..."
              />
            </div>
          </div>

          {/* =========================================================================
              Editor Bottom Status Bar
             ========================================================================= */}
          <div className="flex items-center justify-between border-t border-zinc-800 bg-[#090c12] px-3 py-1 text-[11px] font-mono text-zinc-400 shrink-0">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-cyan-300">
                <FileCode className="h-3 w-3 text-cyan-400" />
                {activeFile.name}
              </span>
              <span>•</span>
              <span className="text-zinc-300">{activeBoard.mcu}</span>
              <span>•</span>
              <span>Spaces: 2</span>
              <span>•</span>
              <span>UTF-8</span>
            </div>

            <div className="flex items-center gap-3">
              {analysis.baudRate && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <Radio className="h-3 w-3" />
                  {analysis.baudRate} Baud
                </span>
              )}
              {analysis.blockingDelays.length > 0 && (
                <span
                  onClick={() => {
                    setIsConsoleOpen(true);
                    setConsoleTab("problems");
                  }}
                  className="flex items-center gap-1 text-amber-400 cursor-pointer hover:underline"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {analysis.blockingDelays.length} Warning{analysis.blockingDelays.length > 1 ? "s" : ""}
                </span>
              )}
              <span className="text-zinc-300">
                Ln {cursorPos.line}, Col {cursorPos.col}
              </span>
              <span className="text-zinc-500 hidden sm:inline">
                {activeLines.length} lines • {activeFile.content.length} chars
              </span>

              {/* Bottom Console Toggle */}
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition-colors border ${
                  isConsoleOpen
                    ? "bg-zinc-800 text-cyan-300 border-zinc-700"
                    : "text-zinc-500 hover:text-zinc-200 border-transparent hover:bg-zinc-800/50"
                }`}
                title="Toggle Output & Serial Monitor Terminal"
              >
                <Terminal className="h-3 w-3" />
                <span>Console</span>
              </button>
            </div>
          </div>

          {/* =========================================================================
              Collapsible Bottom Panel: Build Log, Serial Monitor, Problems
             ========================================================================= */}
          {isConsoleOpen && (
            <div className="h-44 md:h-52 border-t border-zinc-800 bg-[#0d1017] flex flex-col shrink-0 overflow-hidden font-mono text-xs">
              {/* Bottom Tabs */}
              <div className="flex items-center justify-between border-b border-zinc-800 bg-[#090c12] px-2 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setConsoleTab("build")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-t text-xs font-semibold transition-colors border-b-2 ${
                      consoleTab === "build"
                        ? "border-cyan-400 text-cyan-300 bg-[#0d1017]"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>Build Output</span>
                    {compileStatus === "success" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                    {compileStatus === "error" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                    )}
                  </button>

                  <button
                    onClick={() => setConsoleTab("serial")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-t text-xs font-semibold transition-colors border-b-2 ${
                      consoleTab === "serial"
                        ? "border-cyan-400 text-cyan-300 bg-[#0d1017]"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Radio className="h-3.5 w-3.5" />
                    <span>Serial Monitor</span>
                    <span className="px-1 py-0.2 bg-zinc-800 rounded text-[10px] text-zinc-400">
                      {serialBaud}
                    </span>
                  </button>

                  <button
                    onClick={() => setConsoleTab("problems")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-t text-xs font-semibold transition-colors border-b-2 ${
                      consoleTab === "problems"
                        ? "border-cyan-400 text-cyan-300 bg-[#0d1017]"
                        : "border-transparent text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Problems ({analysis.blockingDelays.length})</span>
                  </button>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 pb-1">
                  {consoleTab === "serial" && (
                    <select
                      value={serialBaud}
                      onChange={(e) => setSerialBaud(parseInt(e.target.value, 10))}
                      className="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-[10px] text-zinc-300 focus:outline-none"
                    >
                      <option value={9600}>9600 Baud</option>
                      <option value={19200}>19200 Baud</option>
                      <option value={38400}>38400 Baud</option>
                      <option value={57600}>57600 Baud</option>
                      <option value={115200}>115200 Baud</option>
                    </select>
                  )}

                  <button
                    onClick={() => {
                      if (consoleTab === "build") setBuildLogs([]);
                      if (consoleTab === "serial") setSerialLogs([]);
                    }}
                    className="text-zinc-500 hover:text-zinc-300 p-0.5"
                    title="Clear Console"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => setIsConsoleOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300 p-0.5"
                    title="Close Console"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Console Body Tab 1: Build Output */}
              {consoleTab === "build" && (
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1 font-mono text-[11px] bg-[#0d1017]">
                  {buildLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`${
                        log.includes("ERROR")
                          ? "text-rose-400 font-bold"
                          : log.includes("SUCCESS") || log.includes("✓")
                          ? "text-emerald-400 font-bold"
                          : log.includes("SIZE")
                          ? "text-cyan-300"
                          : "text-zinc-400"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                  {isCompiling && (
                    <div className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Compiling object files and calculating footprint...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Console Tab 2: Serial Monitor */}
              {consoleTab === "serial" && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#0a0d14]">
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[11px] font-mono">
                    {serialLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2">
                        <span className="text-zinc-600 shrink-0">[{log.time}]</span>
                        <span
                          className={`font-bold shrink-0 ${
                            log.tag === "TX"
                              ? "text-cyan-400"
                              : log.tag === "RX"
                              ? "text-emerald-400"
                              : log.tag === "BOOT"
                              ? "text-amber-400"
                              : "text-zinc-400"
                          }`}
                        >
                          [{log.tag}]
                        </span>
                        <span className="text-zinc-200">{log.text}</span>
                      </div>
                    ))}
                    <div ref={serialEndRef} />
                  </div>

                  {/* Serial Command Input */}
                  <div className="flex items-center gap-1.5 border-t border-zinc-800 bg-[#0e121a] p-1.5">
                    <input
                      type="text"
                      value={serialCommand}
                      onChange={(e) => setSerialCommand(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendSerialCommand();
                      }}
                      placeholder="Send Serial payload (e.g., PING, STATUS, AT+CMD)..."
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      onClick={handleSendSerialCommand}
                      className="flex items-center gap-1 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Console Tab 3: Problems List */}
              {consoleTab === "problems" && (
                <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 bg-[#0d1017]">
                  {analysis.blockingDelays.length === 0 ? (
                    <div className="text-emerald-400 flex items-center gap-2 p-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>No code problems or blocking delays detected! Sketch is optimized.</span>
                    </div>
                  ) : (
                    analysis.blockingDelays.map((delay, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-amber-950/20 border border-amber-900/50 text-xs"
                      >
                        <div
                          onClick={() => handleJumpToLine(delay.line)}
                          className="flex items-center gap-2 cursor-pointer hover:underline text-amber-200"
                        >
                          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                          <span>
                            Blocking delay({delay.durationMs}ms) freezes sensor polling.
                          </span>
                          <span className="text-zinc-400 font-bold">Line {delay.line}</span>
                        </div>

                        <button
                          onClick={() => handleFixDelay(delay.line)}
                          className="px-2 py-0.5 rounded bg-cyan-900/40 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/60 text-[10px] font-semibold transition-colors"
                        >
                          Auto-Fix with millis()
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================================================================
            Right Collapsible Inspector Pane
           ========================================================================= */}
        {isInspectorOpen && (
          <div className="w-80 md:w-96 border-l border-zinc-800 bg-[#10141e] flex flex-col shrink-0 overflow-hidden text-xs font-mono select-none">
            {/* Inspector Navigation Tabs */}
            <div className="flex items-center border-b border-zinc-800 bg-[#0a0d14] px-2 pt-2 gap-1 shrink-0">
              <button
                onClick={() => setInspectorTab("diagnostics")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs transition-colors border-b-2 ${
                  inspectorTab === "diagnostics"
                    ? "border-cyan-400 text-cyan-300 bg-[#10141e] font-bold"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Diagnostics</span>
                {analysis.diagnostics.filter((d) => d.type === "warning").length > 0 && (
                  <span className="ml-1 rounded-full bg-amber-500/20 text-amber-400 px-1.5 py-0.2 text-[10px]">
                    {analysis.diagnostics.filter((d) => d.type === "warning").length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setInspectorTab("pins")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs transition-colors border-b-2 ${
                  inspectorTab === "pins"
                    ? "border-cyan-400 text-cyan-300 bg-[#10141e] font-bold"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Pins ({analysis.extractedPins.length})</span>
              </button>

              <button
                onClick={() => setInspectorTab("platformio")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs transition-colors border-b-2 ${
                  inspectorTab === "platformio"
                    ? "border-cyan-400 text-cyan-300 bg-[#10141e] font-bold"
                    : "border-transparent text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span>Hardware</span>
              </button>
            </div>

            {/* Inspector Body Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Tab 1: Static Linter & Diagnostics */}
              {inspectorTab === "diagnostics" && (
                <div className="space-y-3">
                  {/* Firmware Health Score Badge */}
                  <div className="rounded-xl border border-zinc-800 bg-[#141924] p-3 flex items-center justify-between shadow-xs">
                    <div>
                      <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                        Firmware Health
                      </div>
                      <div className="text-lg font-bold text-cyan-300 mt-0.5">
                        {analysis.blockingDelays.length === 0 ? "100% Optimized" : "Needs Optimization"}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {analysis.stats.lineCount} lines analyzed deterministically
                      </div>
                    </div>
                    <div className="h-10 w-10 rounded-full border-2 border-cyan-500/40 flex items-center justify-center bg-cyan-950/40 text-cyan-300 font-bold text-xs">
                      {analysis.blockingDelays.length === 0 ? "A+" : "B"}
                    </div>
                  </div>

                  {/* Diagnostic Badges */}
                  <div className="space-y-2">
                    {analysis.diagnostics.map((diag) => {
                      const isWarning = diag.type === "warning";
                      const isSuccess = diag.type === "success";

                      return (
                        <div
                          key={diag.id}
                          className={`rounded-lg border p-2.5 space-y-1 transition-colors ${
                            isWarning
                              ? "border-amber-900/60 bg-amber-950/20 text-amber-200"
                              : isSuccess
                              ? "border-emerald-900/60 bg-emerald-950/20 text-emerald-200"
                              : "border-zinc-800 bg-zinc-900/50 text-zinc-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              {isWarning ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                              ) : isSuccess ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                              )}
                              <span>{diag.title}</span>
                            </div>
                            {diag.line && (
                              <button
                                onClick={() => handleJumpToLine(diag.line!)}
                                className="rounded bg-zinc-800/80 hover:bg-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-300 shrink-0 transition-colors cursor-pointer"
                                title="Jump to line in editor"
                              >
                                Line {diag.line}
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-normal pl-5">
                            {diag.detail}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Detected Libraries */}
                  {analysis.detectedLibraries.length > 0 && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5 space-y-1.5">
                      <div className="text-zinc-300 font-bold text-[11px] flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-cyan-400" />
                        <span>Included Libraries ({analysis.detectedLibraries.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {analysis.detectedLibraries.map((lib, idx) => (
                          <span
                            key={idx}
                            className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300 font-mono border border-zinc-700/60"
                          >
                            &lt;{lib}&gt;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">
                      <div className="text-zinc-500">Lines of Code</div>
                      <div className="text-base font-bold text-zinc-100 mt-0.5">
                        {analysis.stats.lineCount}
                      </div>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5">
                      <div className="text-zinc-500">Hardware Pins</div>
                      <div className="text-base font-bold text-cyan-300 mt-0.5">
                        {analysis.stats.pinCount}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Hardware Pin Analysis & Cross-Reference */}
              {inspectorTab === "pins" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-bold text-zinc-200">Hardware Pin Mapping</span>
                    <button
                      onClick={handleSyncPinsFromCircuit}
                      className="text-cyan-400 hover:text-cyan-300 text-[10px] font-bold flex items-center gap-1"
                    >
                      <Layers className="h-3 w-3" />
                      <span>Sync All</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Pins declared in firmware correlated against Circuit Studio wire connections.
                  </p>

                  <div className="space-y-2 mt-2">
                    {analysis.extractedPins.length === 0 ? (
                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/20 p-4 text-center text-zinc-500 text-xs">
                        No GPIO pin references found in code.
                      </div>
                    ) : (
                      analysis.extractedPins.map((p, idx) => {
                        // Check if circuit connection exists
                        const matchingConn = circuitConnections.find(
                          (c: any) =>
                            c.targetPin?.toLowerCase() === p.pin.toLowerCase() ||
                            c.sourcePin?.toLowerCase() === p.pin.toLowerCase() ||
                            p.pin.toLowerCase().includes((c.targetPin || "").toLowerCase())
                        );

                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-cyan-300 text-xs">Pin {p.pin}</span>
                              <button
                                onClick={() => handleJumpToLine(p.lineNumbers[0])}
                                className="text-[10px] text-zinc-500 hover:text-zinc-300"
                              >
                                Line {p.lineNumbers.join(", ")}
                              </button>
                            </div>

                            <div className="text-[10px] text-zinc-400">
                              Operations: <span className="text-zinc-200">{p.operations.join(" • ")}</span>
                            </div>

                            <div className="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-[10px]">
                              {matchingConn ? (
                                <span className="inline-flex items-center gap-1 text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Wired to {matchingConn.sourceComponentId || matchingConn.targetComponentId}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-zinc-500">
                                  <Info className="h-3 w-3" />
                                  Not wired in Circuit Studio
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Target Board & PlatformIO Profile */}
              {inspectorTab === "platformio" && (
                <div className="space-y-3">
                  {/* Microcontroller Specifications Card */}
                  <div className="rounded-xl border border-zinc-800 bg-[#141924] p-3 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-cyan-300 text-xs">{activeBoard.label}</span>
                      <span className="text-[10px] text-zinc-500 font-bold px-1.5 py-0.5 rounded bg-zinc-800">
                        {activeBoard.voltage}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] text-zinc-300 pt-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Architecture:</span>
                        <span>{activeBoard.mcu}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Clock Speed:</span>
                        <span>{activeBoard.freq}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Flash Memory:</span>
                        <span>{activeBoard.flash}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">SRAM Memory:</span>
                        <span>{activeBoard.sram}</span>
                      </div>
                    </div>
                  </div>

                  {/* platformio.ini Preview */}
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="font-bold text-zinc-200">platformio.ini Preview</span>
                    <button
                      onClick={handleDownloadPlatformIo}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Ready configuration for VS Code PlatformIO with telemetry baud rate configured.
                  </p>

                  <div className="rounded-lg border border-zinc-800 bg-[#080a0f] p-3 overflow-x-auto text-[11px] text-cyan-200 font-mono leading-relaxed whitespace-pre">
                    {generatePlatformIoIni(selectedBoardId, analysis.baudRate || 115200)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          New File Modal
         ========================================================================= */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-4 space-y-3 font-mono shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-cyan-400" />
                Create New Firmware File
              </span>
              <button
                onClick={() => setShowNewFileModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Enter file name with extension (e.g., <code className="text-cyan-300">sensors.h</code> or <code className="text-cyan-300">driver.cpp</code>):
            </p>

            <input
              type="text"
              value={newFileNameInput}
              onChange={(e) => setNewFileNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateNewFile();
                if (e.key === "Escape") setShowNewFileModal(false);
              }}
              placeholder="e.g. telemetry.h"
              className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowNewFileModal(false)}
                className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewFile}
                className="px-3 py-1.5 rounded text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-xs"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
