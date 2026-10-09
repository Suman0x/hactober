"use client";

export interface SyntaxToken {
  type:
    | "keyword"
    | "type"
    | "arduino-api"
    | "preprocessor"
    | "constant"
    | "string"
    | "number"
    | "comment"
    | "punctuation"
    | "operator"
    | "identifier"
    | "whitespace";
  text: string;
}

const C_KEYWORDS = new Set([
  "if", "else", "for", "while", "do", "switch", "case", "default", "break",
  "continue", "return", "goto", "class", "struct", "enum", "public", "private",
  "protected", "const", "static", "volatile", "extern", "inline", "virtual",
  "override", "typedef", "new", "delete", "this", "sizeof", "namespace", "using"
]);

const C_TYPES = new Set([
  "void", "int", "uint8_t", "uint16_t", "uint32_t", "uint64_t", "int8_t",
  "int16_t", "int32_t", "int64_t", "char", "unsigned", "signed", "long", "short",
  "float", "double", "bool", "boolean", "byte", "word", "String", "size_t", "auto"
]);

const ARDUINO_APIS = new Set([
  "setup", "loop", "pinMode", "digitalWrite", "digitalRead", "analogRead",
  "analogWrite", "delay", "delayMicroseconds", "millis", "micros", "map",
  "constrain", "pulseIn", "attachInterrupt", "detachInterrupt", "interrupts",
  "noInterrupts", "tone", "noTone", "random", "randomSeed", "min", "max", "abs",
  "Serial", "Serial1", "Serial2", "Wire", "SPI", "WiFi", "BLE", "EEPROM"
]);

const CONSTANTS = new Set([
  "HIGH", "LOW", "INPUT", "OUTPUT", "INPUT_PULLUP", "LED_BUILTIN",
  "true", "false", "HIGH_ACCURACY", "DEC", "HEX", "OCT", "BIN", "NULL", "nullptr"
]);

/**
 * Tokenize a single line of C++/Arduino code
 */
export function tokenizeLine(line: string, inBlockComment: boolean): { tokens: SyntaxToken[]; endsInBlockComment: boolean } {
  const tokens: SyntaxToken[] = [];
  let i = 0;
  const len = line.length;

  if (inBlockComment) {
    const endCommentIdx = line.indexOf("*/");
    if (endCommentIdx === -1) {
      tokens.push({ type: "comment", text: line });
      return { tokens, endsInBlockComment: true };
    } else {
      tokens.push({ type: "comment", text: line.substring(0, endCommentIdx + 2) });
      i = endCommentIdx + 2;
    }
  }

  // Preprocessor line check: e.g. #include <Wire.h> or #define LED 13
  const trimmed = line.trimStart();
  if (i === 0 && trimmed.startsWith("#")) {
    const leadingSpaces = line.substring(0, line.length - trimmed.length);
    if (leadingSpaces) {
      tokens.push({ type: "whitespace", text: leadingSpaces });
    }
    // Check if there is an inline comment
    const commentIdx = trimmed.indexOf("//");
    if (commentIdx !== -1) {
      tokens.push({ type: "preprocessor", text: trimmed.substring(0, commentIdx) });
      tokens.push({ type: "comment", text: trimmed.substring(commentIdx) });
    } else {
      tokens.push({ type: "preprocessor", text: trimmed });
    }
    return { tokens, endsInBlockComment: false };
  }

  while (i < len) {
    // 1. Whitespace
    if (/\s/.test(line[i])) {
      let ws = "";
      while (i < len && /\s/.test(line[i])) {
        ws += line[i];
        i++;
      }
      tokens.push({ type: "whitespace", text: ws });
      continue;
    }

    // 2. Comments
    if (line[i] === "/" && i + 1 < len) {
      if (line[i + 1] === "/") {
        // Line comment
        tokens.push({ type: "comment", text: line.substring(i) });
        break;
      } else if (line[i + 1] === "*") {
        // Block comment start
        const endIdx = line.indexOf("*/", i + 2);
        if (endIdx === -1) {
          tokens.push({ type: "comment", text: line.substring(i) });
          return { tokens, endsInBlockComment: true };
        } else {
          tokens.push({ type: "comment", text: line.substring(i, endIdx + 2) });
          i = endIdx + 2;
          continue;
        }
      }
    }

    // 3. String literals ("..." or '<...>')
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let str = quote;
      i++;
      let escaped = false;
      while (i < len) {
        str += line[i];
        if (line[i] === "\\" && !escaped) {
          escaped = true;
        } else if (line[i] === quote && !escaped) {
          i++;
          break;
        } else {
          escaped = false;
        }
        i++;
      }
      tokens.push({ type: "string", text: str });
      continue;
    }

    // 4. Numbers (hex, binary, decimals, floats)
    if (/\d/.test(line[i]) || (line[i] === "." && i + 1 < len && /\d/.test(line[i + 1]))) {
      let num = "";
      // hex 0x...
      if (line[i] === "0" && i + 1 < len && (line[i + 1] === "x" || line[i + 1] === "X")) {
        num += line[i] + line[i + 1];
        i += 2;
        while (i < len && /[0-9a-fA-F]/.test(line[i])) {
          num += line[i];
          i++;
        }
      } else if (line[i] === "0" && i + 1 < len && (line[i + 1] === "b" || line[i + 1] === "B")) {
        // binary 0b...
        num += line[i] + line[i + 1];
        i += 2;
        while (i < len && /[01]/.test(line[i])) {
          num += line[i];
          i++;
        }
      } else {
        while (i < len && /[0-9.a-fA-FULf]/.test(line[i])) {
          num += line[i];
          i++;
        }
      }
      tokens.push({ type: "number", text: num });
      continue;
    }

    // 5. Word tokens (Identifiers, Keywords, APIs, Constants)
    if (/[a-zA-Z_]/.test(line[i])) {
      let word = "";
      while (i < len && /[a-zA-Z0-9_]/.test(line[i])) {
        word += line[i];
        i++;
      }

      if (C_KEYWORDS.has(word)) {
        tokens.push({ type: "keyword", text: word });
      } else if (C_TYPES.has(word)) {
        tokens.push({ type: "type", text: word });
      } else if (ARDUINO_APIS.has(word)) {
        tokens.push({ type: "arduino-api", text: word });
      } else if (CONSTANTS.has(word)) {
        tokens.push({ type: "constant", text: word });
      } else {
        // Check if next non-whitespace is '(' => function call
        let lookahead = i;
        while (lookahead < len && /\s/.test(line[lookahead])) lookahead++;
        if (lookahead < len && line[lookahead] === "(") {
          tokens.push({ type: "arduino-api", text: word });
        } else {
          tokens.push({ type: "identifier", text: word });
        }
      }
      continue;
    }

    // 6. Operators & Punctuation
    const char = line[i];
    if (/[{}()[\];,.]/.test(char)) {
      tokens.push({ type: "punctuation", text: char });
    } else {
      tokens.push({ type: "operator", text: char });
    }
    i++;
  }

  return { tokens, endsInBlockComment: false };
}

/**
 * Returns Tailwind color style for token type
 */
export function getTokenClass(type: SyntaxToken["type"]): string {
  switch (type) {
    case "keyword":
      return "text-purple-400 font-medium";
    case "type":
      return "text-cyan-300 font-medium";
    case "arduino-api":
      return "text-sky-400 font-semibold";
    case "preprocessor":
      return "text-pink-400 font-medium";
    case "constant":
      return "text-amber-300 font-medium";
    case "string":
      return "text-emerald-300";
    case "number":
      return "text-amber-400";
    case "comment":
      return "text-zinc-500 italic";
    case "punctuation":
      return "text-zinc-400";
    case "operator":
      return "text-teal-300";
    case "identifier":
      return "text-zinc-100";
    case "whitespace":
    default:
      return "text-zinc-200";
  }
}
