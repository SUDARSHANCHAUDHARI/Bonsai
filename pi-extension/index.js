import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { DEFAULT_MODE, getDefaultMode, normalizeMode, normalizePersistedMode } = require("../hooks/bonsai-config.js");
const { getBonsaiInstructions, filterSkillBodyForMode } = require("../hooks/bonsai-instructions.js");

export { filterSkillBodyForMode };
export const readDefaultMode = getDefaultMode;

// Walk session entries newest-first for the last persisted mode switch.
export function resolveSessionMode(entries, fallbackMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(fallbackMode) || DEFAULT_MODE;
  if (!Array.isArray(entries)) return fallback;
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i];
    if (entry?.type !== "custom" || entry?.customType !== "bonsai-mode") continue;
    const mode = normalizePersistedMode(entry?.data?.mode);
    if (mode) return mode;
  }
  return fallback;
}

export function parseBonsaiCommand(text, defaultMode = DEFAULT_MODE) {
  const fallback = normalizePersistedMode(defaultMode) || DEFAULT_MODE;
  const t = String(text || "").trim().toLowerCase();
  if (!t) return { type: "set-mode", mode: fallback === "off" ? "full" : fallback };
  const [primary] = t.split(/\s+/);
  if (primary === "status") return { type: "status" };
  if (primary === "off") return { type: "set-mode", mode: "off" };
  const mode = normalizeMode(primary);
  return mode ? { type: "set-mode", mode } : { type: "invalid", mode: primary };
}

export default function bonsaiExtension(pi) {
  let currentMode = DEFAULT_MODE;
  const configuredDefaultMode = getDefaultMode();

  const setMode = (mode, ctx) => {
    const normalized = normalizePersistedMode(mode);
    if (!normalized) return;
    currentMode = normalized;
    pi.appendEntry("bonsai-mode", { mode: normalized });
    ctx?.ui?.notify?.(`Bonsai mode set to ${normalized}.`, "info");
  };

  const sendAlias = (skillName, ctx) => {
    if (ctx?.isIdle?.() === false) {
      pi.sendUserMessage(skillName, { deliverAs: "followUp" });
      ctx?.ui?.notify?.(`${skillName} queued as follow-up.`, "info");
      return;
    }
    pi.sendUserMessage(skillName);
  };

  pi.registerCommand("bonsai", {
    description: "Set or report bonsai mode",
    handler: async (args, ctx) => {
      const parsed = parseBonsaiCommand(args, configuredDefaultMode);
      if (parsed.type === "status") {
        ctx?.ui?.notify?.(`Bonsai: current ${currentMode} • default ${configuredDefaultMode}`, "info");
        return;
      }
      if (parsed.type === "set-mode") { setMode(parsed.mode, ctx); return; }
      ctx?.ui?.notify?.("Unknown /bonsai mode (use lite|full|ultra|off).", "warning");
    },
  });

  for (const name of ["bonsai-review", "bonsai-audit", "bonsai-debt", "bonsai-help"]) {
    pi.registerCommand(name, {
      description: `Run /skill:${name}`,
      handler: (_args, ctx) => sendAlias(`/skill:${name}`, ctx),
    });
  }

  pi.on("input", async (event) => {
    if (event?.source === "extension") return;
    const text = String(event?.text || "");
    if (currentMode !== "off" && /\b(stop bonsai|normal mode)\b/i.test(text)) setMode("off");
  });

  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx?.sessionManager?.getBranch?.() || ctx?.sessionManager?.getEntries?.() || [];
    currentMode = resolveSessionMode(entries, getDefaultMode());
  });

  pi.on("before_agent_start", async (event) => {
    if (!currentMode || currentMode === "off") return;
    return { systemPrompt: `${event.systemPrompt}\n\n${getBonsaiInstructions(currentMode)}` };
  });
}
