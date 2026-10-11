# CIRCUITDOCTOR

**Build it. Debug it. Learn it.**

CircuitDoctor is an AI-powered hardware development platform that helps electronics beginners and embedded engineers build electronics projects from scratch, design circuits visually, understand existing hardware, and troubleshoot real-world physical circuits.

---

**Wbsite live link : ** https://hactober.onrender.com

## 🌟 The Three Core Experiences

### 1. Circuit Doctor (`/circuit-doctor`)
- **Multimodal Image Diagnosis**: Upload circuit photos (JPEG, PNG, WebP) to analyze visible hardware topology with Google Gemini Vision.
- **Evidence Classification**: Strict separation between *Observed in Image*, *Likely*, *Uncertain*, and *Supplied by User*. Never assumes safety from a photo alone.
- **Interactive Multimeter Procedures**: Formulates testable hypotheses with explicit multimeter verification steps and expected resistance/voltage readings.
- **Investigation Tracking**: Record test results (*Passed*, *Failed*, *Inconclusive*) and persist diagnostic history in PostgreSQL.

### 2. Project Builder (`/builder`)
- **Natural Language Architecture**: Input high-level project goals, target microcontroller (ESP32, Arduino Uno, Arduino Nano, Raspberry Pi Pico), and budget in Indian Rupees (₹ INR).
- **Structured Schematics**: Produces validated component-and-connection graphs linking real pins (e.g., `3V3`, `GND`, `GPIO34`, `SDA`, `SCL`).
- **Complete Starter Firmware**: Compilable code tailored to the exact pin mapping with line-by-line explanations.
- **Step-by-Step Build Guide**: Checkable assembly steps with common mistakes and safety notes.
- **Bill of Materials (BOM)**: Comprehensive parts list with estimated pricing and CSV export.

### 3. Circuit Studio (`/circuit-studio`)
- **Interactive Component & Wire Canvas**: Built on `@xyflow/react` with custom hardware nodes and named pin handles.
- **Extensible Component Registry**: Preloaded with MCUs, sensors (DHT22, Ultrasonic, Soil Moisture, LDR), actuators (Servos, Motors, Relays, Buzzers), and displays (SSD1306 OLED).
- **Live Design Rule Checker**: Warns about floating inputs, missing power/GND rails, or unconnected components.
- **Export & Project Sync**: Save designs directly into your project workspace or export JSON schematics.

---

## 🚀 Supporting Capabilities

- **Workspaces (`/projects` & `/projects/[id]`)**: Full persistent development workspaces containing circuit diagrams, firmware, BOMs, pin cross-checks, and diagnostic logs.
- **Circuit-to-Firmware Pin Mapping**: Automatically cross-checks firmware GPIO calls against Circuit Studio wire connections, flagging unreferenced or mismatched pins.
- **Firmware IDE**: Syntax-highlighted code editor with deterministic regex pattern-based pin extraction.
- **Component Catalogue (`/components`)**: Searchable database of microcontrollers, sensors, actuators, and passive components with pinouts and voltage specifications.
- **Project Discovery Library (`/discover`)**: 8 pre-seeded reference hardware projects (Smart Irrigation, Obstacle-Avoiding Robot, Weather Station, etc.).
- **AI Idea Generator**: Brainstorm tailored hardware ideas matching specific constraints and budget targets.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Visual Circuit Canvas**: `@xyflow/react` (React Flow)
- **Database & Storage**: PostgreSQL (`pg` pool, auto-bootstrapping DDL, resilient in-memory fallback)
- **AI Engine**: Google AI Studio / Google GenAI SDK
  - Text & Planning: `gemma-4-26b-a4b-it` (with auto-fallback to `gemini-3.8-flash`)
  - Image Diagnostics: `gemini-3.8-flash` (Multimodal Vision)
- **Validation**: Zod schema validation

---

## ⚙️ Environment Configuration

Create or update `.env` in `hactober/`:

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://username@localhost:5432/circuitdoctor"

# Google AI Studio API Key (Free tier from https://aistudio.google.com/app/apikey)
GEMMA_API_KEY="your_api_key_here"

# Model Selection
GEMMA_MODEL="gemma-4-26b-a4b-it"
VISION_MODEL="gemini-3.8-flash"

NEXT_PUBLIC_APP_NAME="CircuitDoctor"
```

---

## 🏃 Getting Started Locally

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm run test

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access CircuitDoctor.

---

## 🧪 Verification & Testing

Run the automated verification suite:

```bash
npm run test
```

Verifies:
- Firmware static pin analysis
- Component registry layouts
- PostgreSQL database seeding & persistence
- Project creation & retrieval
- Circuit save and reload cycle
- Diagnostic session creation & multimeter test recording
- Component catalogue querying
- Zod schema validation for AI project plans & diagnostic results
