export interface CircuitDoctorPreset {
  id: string;
  name: string;
  badge: string;
  boardType: string;
  knownComponents: string;
  expectedBehavior: string;
  actualBehavior: string;
  firmwareCode: string;
  svgDataUri: string;
}

// Generate inline SVG Data URI for clean crisp schematic diagrams
const generateSvgDataUri = (title: string, subtitle: string, warningColor: string, labels: string[]) => {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0f1d"/>
      <stop offset="100%" stop-color="#030712"/>
    </linearGradient>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <rect width="800" height="500" fill="url(#grid)"/>

  <!-- PCB Outline -->
  <rect x="60" y="50" width="680" height="400" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="3"/>

  <!-- Circuit Header -->
  <circle cx="95" cy="85" r="7" fill="${warningColor}"/>
  <text x="115" y="90" fill="#f8fafc" font-family="monospace" font-size="16" font-weight="bold">${title}</text>
  <text x="115" y="112" fill="#94a3b8" font-family="monospace" font-size="12">${subtitle}</text>

  <!-- MCU Board Representation -->
  <rect x="100" y="145" width="240" height="260" rx="10" fill="#090d16" stroke="#0284c7" stroke-width="2"/>
  <rect x="130" y="170" width="180" height="120" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="220" y="235" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">MCU CORE</text>
  <text x="220" y="255" fill="#64748b" font-family="monospace" font-size="10" text-anchor="middle">ACTIVE SOC / CHIP</text>

  <!-- Pins along MCU edge -->
  <circle cx="340" cy="180" r="4" fill="#e2e8f0"/>
  <circle cx="340" cy="210" r="4" fill="#e2e8f0"/>
  <circle cx="340" cy="240" r="4" fill="#e2e8f0"/>
  <circle cx="340" cy="270" r="4" fill="#e2e8f0"/>
  <circle cx="340" cy="300" r="4" fill="#e2e8f0"/>
  <circle cx="340" cy="330" r="4" fill="#e2e8f0"/>

  <!-- Peripheral / Sensor Representation -->
  <rect x="460" y="170" width="240" height="210" rx="10" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
  <text x="580" y="210" fill="#f1f5f9" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">PERIPHERAL MODULE</text>

  <!-- Wiring connections -->
  <path d="M 340 180 L 410 180 L 410 240 L 460 240" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="6,3"/>
  <path d="M 340 210 L 460 210" fill="none" stroke="#22c55e" stroke-width="2.5"/>
  <path d="M 340 270 L 460 270" fill="none" stroke="#3b82f6" stroke-width="2.5"/>
  <path d="M 340 330 L 460 330" fill="none" stroke="#eab308" stroke-width="2.5"/>

  <!-- Diagnostic annotations -->
  <g transform="translate(480, 240)">
    ${labels
      .map(
        (lbl, idx) =>
          `<text x="10" y="${idx * 28 + 20}" fill="#cbd5e1" font-family="monospace" font-size="11">▸ ${lbl}</text>`
      )
      .join("")}
  </g>

  <!-- Inspection Crosshairs / Watermark -->
  <circle cx="410" cy="210" r="18" fill="none" stroke="${warningColor}" stroke-width="2"/>
  <line x1="410" y1="185" x2="410" y2="235" stroke="${warningColor}" stroke-width="1.5"/>
  <line x1="385" y1="210" x2="435" y2="210" stroke="${warningColor}" stroke-width="1.5"/>
  <text x="410" y="180" fill="${warningColor}" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">FAULT ZONE</text>
</svg>
`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const CIRCUIT_DOCTOR_PRESETS: CircuitDoctorPreset[] = [
  {
    id: "esp32-reverse-polarity",
    name: "ESP32 Reverse Polarity & Hot LDO",
    badge: "Overvoltage / Direct Short",
    boardType: "ESP32",
    knownComponents: "ESP32 DevKit V1, AMS1117-3.3 Linear Regulator, 12V LiPo Battery pack via VIN",
    expectedBehavior:
      "ESP32 boots normally, power LED stays illuminated solid blue, 3.3V rail measures 3.30V DC.",
    actualBehavior:
      "Power LED doesn't light up. AMS1117 LDO voltage regulator gets scorching hot to the touch within 2 seconds. USB port cut out on host PC with overcurrent notification.",
    firmwareCode: `// Firmware: Standard Blink / WiFi Scan
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
}
void loop() {
  digitalWrite(2, HIGH);
  delay(500);
  digitalWrite(2, LOW);
  delay(500);
}`,
    svgDataUri: generateSvgDataUri(
      "ESP32 POWER STAGE — REVERSE POLARITY HAZARD",
      "Thermal overload on AMS1117-3.3 rail",
      "#ef4444",
      [
        "VIN/GND terminals reversed",
        "Schottky clamp diode conducting",
        "Regulator thermal shutdown",
        "Multimeter test: Check VIN polarity",
      ]
    ),
  },
  {
    id: "dht22-nan-floating",
    name: "DHT22 Sensor Reading NaN / Floating",
    badge: "Missing Pull-Up Resistor",
    boardType: "ESP32",
    knownComponents: "DHT22 (AM2302) Humidity & Temperature Sensor, GPIO 4",
    expectedBehavior:
      "Serial monitor prints valid humidity (e.g. 48.2%) and temperature (e.g. 24.5C) every 2 seconds.",
    actualBehavior:
      "Serial monitor constantly prints 'Failed to read from DHT sensor!' and output values are NaN.",
    firmwareCode: `#include "DHT.h"
#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
}
void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
  } else {
    Serial.printf("Temp: %.1f C, Humidity: %.1f %%\\n", t, h);
  }
  delay(2000);
}`,
    svgDataUri: generateSvgDataUri(
      "DHT22 ONE-WIRE BUS — FLOATING DATA PIN",
      "Missing 4.7kΩ - 10kΩ VCC Pull-up Resistor",
      "#f59e0b",
      [
        "Data pin floating at intermediate V",
        "Handshake pulse timeouts on bus",
        "Solution: Add 10kΩ between Pin 1 & 2",
        "Multimeter test: Check idle Data line DC V",
      ]
    ),
  },
  {
    id: "oled-i2c-swapped",
    name: "SSD1306 0.96\" I2C Blank / Swapped Pins",
    badge: "Bus Bus Communication Failure",
    boardType: "ESP32",
    knownComponents: "SSD1306 128x64 I2C OLED Display, ESP32 GPIO 21 & GPIO 22",
    expectedBehavior:
      "OLED initializes and displays real-time telemetry graphics and test patterns.",
    actualBehavior:
      "Screen is completely blank. I2C Scanner firmware loop hangs at Wire.endTransmission() or reports 'No I2C devices found'.",
    firmwareCode: `#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Serial.begin(115200);
  // Default ESP32 I2C: SDA=GPIO 21, SCL=GPIO 22
  Wire.begin(21, 22);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 10);
  display.println("Hello World");
  display.display();
}
void loop() {}`,
    svgDataUri: generateSvgDataUri(
      "SSD1306 I2C BUS — PIN SWAP SUSPECTED",
      "SDA & SCL jumper lines reversed on breadboard",
      "#06b6d4",
      [
        "GPIO 21 wired to SCL (Should be SDA)",
        "GPIO 22 wired to SDA (Should be SCL)",
        "No ACK on 0x3C address query",
        "Multimeter test: Measure pull-up voltages",
      ]
    ),
  },
  {
    id: "servo-brownout-reset",
    name: "SG90 Servo Brownout MCU Reboots",
    badge: "Power Supply Inrush Dip",
    boardType: "Arduino Uno",
    knownComponents: "TowerPro SG90 9g Micro Servo on Pin 9, Arduino Uno on USB 5V",
    expectedBehavior:
      "Servo sweeps smoothly between 0 and 180 degrees continuously without interruptions.",
    actualBehavior:
      "As soon as the servo begins to rotate or encounters slight mechanical resistance, the Arduino's power LED blinks off and the board reboots back to setup().",
    firmwareCode: `#include <Servo.h>
Servo myservo;

void setup() {
  Serial.begin(9600);
  Serial.println("MCU Booting up...");
  myservo.attach(9);
}

void loop() {
  myservo.write(0);
  delay(1000);
  myservo.write(180); // Inrush stall current triggers brownout
  delay(1000);
}`,
    svgDataUri: generateSvgDataUri(
      "INDUCTIVE IN-RUSH — BROWNOUT RESET DETECTED",
      "Shared 5V rail collapses during motor acceleration",
      "#ec4899",
      [
        "Stall current exceeds 500mA USB limit",
        "5V rail sags below 4.3V reset threshold",
        "ATmega328P Brown-Out Detector resets MCU",
        "Fix: Separate 5V servo supply & 470uF cap",
      ]
    ),
  },
];
