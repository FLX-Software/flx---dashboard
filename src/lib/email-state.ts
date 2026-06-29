import "server-only";

import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

interface EmailState {
  deleted: string[];
  read: Record<string, boolean>;
}

const STATE_PATH = path.join(process.cwd(), "data", "email-state.json");

async function loadState(): Promise<EmailState> {
  try {
    const raw = await readFile(STATE_PATH, "utf-8");
    return JSON.parse(raw) as EmailState;
  } catch {
    return { deleted: [], read: {} };
  }
}

async function saveState(state: EmailState) {
  await mkdir(path.dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
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
