import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("FAIL: SUPABASE_URL oder ANON_KEY fehlt in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
const tables = ["profiles", "support_tickets", "tasks", "calendar_events"];

console.log("Supabase URL:", url);
console.log("Anon Key: gesetzt (" + key.length + " Zeichen)\n");

let ok = true;

for (const table of tables) {
  const { error } = await supabase.from(table).select("id").limit(1);
  if (error) {
    console.log(`FAIL  ${table}: ${error.message}`);
    ok = false;
  } else {
    console.log(`OK    ${table}`);
  }
}

const { data: authData, error: authError } = await supabase.auth.getSession();
if (authError) {
  console.log(`INFO  Auth: ${authError.message}`);
} else {
  console.log(`OK    Auth-Client verbunden (Session: ${authData.session ? "ja" : "nein"})`);
}

process.exit(ok ? 0 : 1);
