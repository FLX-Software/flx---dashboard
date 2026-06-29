import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { getDataDir } from "@/lib/data-path";

interface EmailState {
  deleted: string[];
  read: Record<string, boolean>;
}

function getStatePath() {
  return path.join(getDataDir(), "email-state.json");
}

const emptyState = (): EmailState => ({ deleted: [], read: {} });

let memoryState: EmailState | null = null;

async function loadState(): Promise<EmailState> {
  if (memoryState) return memoryState;

  const statePath = getStatePath();

  try {
    const raw = await readFile(statePath, "utf-8");
    const parsed = JSON.parse(raw) as EmailState;
    memoryState = parsed;
    return parsed;
  } catch {
    memoryState = emptyState();
    return memoryState;
  }
}

async function saveState(state: EmailState) {
  memoryState = state;
  const statePath = getStatePath();

  try {
    await mkdir(path.dirname(statePath), { recursive: true });
    await writeFile(statePath, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Ephemeral in-memory fallback on read-only filesystems (e.g. Vercel)
  }
}

export async function applyEmailState<T extends { id: string; read: boolean }>(
  emails: T[]
): Promise<T[]> {
  const state = await loadState();
  return emails
    .filter((e) => !state.deleted.includes(e.id))
    .map((e) => ({
      ...e,
      read: state.read[e.id] ?? e.read,
    }));
}

export async function setEmailReadLocal(id: string, read: boolean) {
  const state = await loadState();
  state.read[id] = read;
  await saveState(state);
}

export async function deleteEmailLocal(id: string) {
  const state = await loadState();
  if (!state.deleted.includes(id)) {
    state.deleted.push(id);
  }
  delete state.read[id];
  await saveState(state);
}
