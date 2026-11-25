#!/usr/bin/env node

/**
 * last-light — a small CLI for one piece of flash fiction.
 *
 * Dependency-free Node.js, typed with TypeScript-flavored JSDoc.
 */

const ENTRY_LINE =
  "The last human on Earth closed the door behind him, and in the dark the smart house kept adjusting itself to a body it could no longer find.";

const PROGRAM_NAME = "last-light";
const VERSION = "1.0.0";
const DEFAULT_WIDTH = 72;
const MIN_WIDTH = 24;
const MAX_WIDTH = 120;

const ANSI = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  italic: "\u001b[3m",
  cyan: "\u001b[36m",
  amber: "\u001b[33m",
};

/** @typedef {"plain" | "fancy" | "json"} OutputMode */

/** @typedef {{ mode: OutputMode, width: number, help: boolean, version: boolean }} CliOptions */

/** @typedef {{ options: CliOptions | null, error: string | null }} ParseResult */

/** Measure a string without counting ANSI escape sequences. @param {string} value @returns {number} */
function visibleLength(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "").length;
}

/** Pad to a visible width rather than an encoded string length. @param {string} value @param {number} width @returns {string} */
function padVisible(value, width) {
  const missing = width - visibleLength(value);
  return missing > 0 ? value + " ".repeat(missing) : value;
}

/** Pick a comfortable width for the current terminal. @returns {number} */
function defaultWidth() {
  const columns = process.stdout.columns;
  if (Number.isInteger(columns) && columns > MIN_WIDTH + 2) {
    return Math.min(DEFAULT_WIDTH, columns - 2);
  }
  return DEFAULT_WIDTH;
}

/** Parse and validate a width value. @param {string} raw @returns {{ width: number | null, error: string | null }} */
function parseWidth(raw) {
  if (!/^\d+$/.test(raw)) {
    return { width: null, error: `--width expects an integer, received "${raw}"` };
  }

  const width = Number.parseInt(raw, 10);
  if (width < MIN_WIDTH || width > MAX_WIDTH) {
    return {
      width: null,
      error: `--width must be between ${MIN_WIDTH} and ${MAX_WIDTH}, received ${width}`,
    };
  }
  return { width, error: null };
}

/** Parse arguments without external dependencies. @param {string[]} args @returns {ParseResult} */
function parseArgs(args) {
  /** @type {CliOptions} */
  const options = {
    mode: "plain",
    width: defaultWidth(),
    help: false,
    version: false,
  };

  /** @type {OutputMode | null} */
  let selectedMode = null;
  let widthWasSet = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--version" || arg === "-v") {
      options.version = true;
      continue;
    }

    if (arg === "--plain" || arg === "--fancy" || arg === "--json") {
      const mode = /** @type {OutputMode} */ (arg.slice(2));
      if (selectedMode !== null) {
        return {
          options: null,
          error: `output modes cannot be combined or repeated (--${selectedMode}, ${arg})`,
        };
      }
      selectedMode = mode;
      options.mode = mode;
      continue;
    }

    if (arg === "--width" || arg.startsWith("--width=")) {
      if (widthWasSet) {
        return { options: null, error: "--width may only be provided once" };
      }

      /** @type {string | undefined} */
      let raw;
      if (arg === "--width") {
        raw = args[index + 1];
        index += 1;
      } else {
        raw = arg.slice("--width=".length);
      }

      if (raw === undefined || raw === "") {
        return { options: null, error: "--width requires a value" };
      }

      const parsed = parseWidth(raw);
      if (parsed.error !== null || parsed.width === null) {
        return { options: null, error: parsed.error };
      }

      options.width = parsed.width;
      widthWasSet = true;
      continue;
    }

    if (arg.startsWith("-")) {
      return { options: null, error: `unknown option: ${arg}` };
    }
    return { options: null, error: `unexpected positional argument: ${arg}` };
  }

  return { options, error: null };
}

/** Usage text; the caller writes it to stderr so stdout remains machine-clean. @returns {string} */
function usage() {
  return [
    `${PROGRAM_NAME} ${VERSION}`,
    "",
    "Usage:",
    "  node main.ts [options]",
    "",
    "Options:",
    "  --plain          Print wrapped prose (default)",
    "  --fancy          Print the story in an ANSI-styled box",
    "  --json           Print machine-readable JSON",
    `  --width <n>      Maximum output width in columns (${MIN_WIDTH}-${MAX_WIDTH})`,
    "  --version        Print the version",
    "  --help           Show this help on stderr",
    "",
    "Examples:",
    "  node main.ts --fancy --width 64",
    "  node main.ts --json",
    "",
  ].join("\n");
}

/** Wrap text at a visible-column boundary without breaking words. @param {string} text @param {number} width @returns {string[]} */
function wrapText(text, width) {
  const words = text.trim().split(/\s+/);
  /** @type {string[]} */
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current === "" ? word : `${current} ${word}`;
    if (candidate.length <= width) {
      current = candidate;
    } else {
      if (current !== "") {
        lines.push(current);
      }
      current = word;
    }
  }

  if (current !== "") {
    lines.push(current);
  }
  return lines;
}

/** Render straightforward wrapped prose. @param {number} width @returns {string} */
function renderPlain(width) {
  return `${wrapText(ENTRY_LINE, width).join("\n")}\n`;
}

/** Render one padded box row. @param {string} content @param {number} innerWidth @returns {string} */
function boxRow(content, innerWidth) {
  return `${ANSI.cyan}│${ANSI.reset} ${padVisible(content, innerWidth)} ${ANSI.cyan}│${ANSI.reset}`;
}

/**
 * Render the story as a boxed terminal artifact. width is the maximum width
 * of the entire frame, matching the meaning used by plain mode.
 * @param {number} width
 * @returns {string}
 */
function renderFancy(width) {
  const innerWidth = width - 4;
  const horizontal = "─".repeat(innerWidth + 2);
  const border = {
    top: `${ANSI.cyan}╭${horizontal}╮${ANSI.reset}`,
    middle: `${ANSI.cyan}├${horizontal}┤${ANSI.reset}`,
    bottom: `${ANSI.cyan}╰${horizontal}╯${ANSI.reset}`,
  };

  /** @type {string[]} */
  const output = [border.top];

  for (const line of wrapText("LAST-LIGHT / DOMESTIC OPTIMIZATION LOG", innerWidth)) {
    output.push(boxRow(`${ANSI.bold}${ANSI.cyan}${line}${ANSI.reset}`, innerWidth));
  }

  output.push(border.middle);
  for (const line of wrapText(ENTRY_LINE, innerWidth)) {
    output.push(boxRow(`${ANSI.italic}${ANSI.amber}${line}${ANSI.reset}`, innerWidth));
  }

  output.push(border.middle);
  for (const line of wrapText("occupant: not found · environment: still adapting", innerWidth)) {
    output.push(boxRow(`${ANSI.dim}${line}${ANSI.reset}`, innerWidth));
  }

  output.push(border.bottom);
  return `${output.join("\n")}\n`;
}

/** Render a stable machine-readable representation. @param {number} width @returns {string} */
function renderJson(width) {
  const payload = {
    program: PROGRAM_NAME,
    version: VERSION,
    width,
    text: ENTRY_LINE,
    lines: wrapText(ENTRY_LINE, width),
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}

/** Render output according to the selected mode. @param {CliOptions} options @returns {string} */
function render(options) {
  if (options.mode === "fancy") {
    return renderFancy(options.width);
  }
  if (options.mode === "json") {
    return renderJson(options.width);
  }
  return renderPlain(options.width);
}

/** Print an error in conventional CLI format. @param {string} message @returns {void} */
function printError(message) {
  process.stderr.write(`${PROGRAM_NAME}: error: ${message}\n`);
  process.stderr.write("Try 'node main.ts --help' for usage.\n");
}

/** Program entry point. @param {string[]} args @returns {number} process exit code */
function run(args) {
  const parsed = parseArgs(args);
  if (parsed.error !== null || parsed.options === null) {
    printError(parsed.error ?? "invalid arguments");
    return 2;
  }

  const options = parsed.options;
  if (options.help) {
    process.stderr.write(usage());
    return 0;
  }

  if (options.version) {
    process.stdout.write(`${PROGRAM_NAME} ${VERSION}\n`);
    return 0;
  }

  process.stdout.write(render(options));
  return 0;
}

process.exitCode = run(process.argv.slice(2));
