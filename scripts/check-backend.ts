import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function check() {
  console.log("Checking tables in Supabase...");

  const { count: needsCount, error: needsErr } = await supabase.from("needs").select("*", { count: "exact", head: true });
  console.log("needs table:", needsErr ? needsErr.message : `OK (${needsCount} rows)`);

  const { count: offersCount, error: offersErr } = await supabase.from("offers").select("*", { count: "exact", head: true });
  console.log("offers table:", offersErr ? offersErr.message : `OK (${offersCount} rows)`);

  const { count: txCount, error: txErr } = await supabase.from("transactions").select("*", { count: "exact", head: true });
  console.log("transactions table:", txErr ? txErr.message : `OK (${txCount} rows)`);

  // Check accept_offer procedure
  const { error: rpcErr } = await supabase.rpc("accept_offer", {
    p_offer_id: "00000000-0000-0000-0000-000000000000",
    p_requester_id: "00000000-0000-0000-0000-000000000000",
  });
  console.log("accept_offer RPC check:", rpcErr ? rpcErr.message : "OK");
}

check();
