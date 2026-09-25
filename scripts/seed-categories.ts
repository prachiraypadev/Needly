import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env.local if not already in process.env
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

const DEFAULT_CATEGORIES = [
  { id: "11111111-1111-1111-1111-111111111111", name: "Tools & Home Improvement", slug: "tools", icon: "Wrench", sort_order: 1, is_active: true },
  { id: "22222222-2222-2222-2222-222222222222", name: "Electronics & Appliances", slug: "electronics", icon: "Tv", sort_order: 2, is_active: true },
  { id: "33333333-3333-3333-3333-333333333333", name: "Books, Notes & Stationery", slug: "books", icon: "BookOpen", sort_order: 3, is_active: true },
  { id: "44444444-4444-4444-4444-444444444444", name: "Sports, Fitness & Hobbies", slug: "sports", icon: "Activity", sort_order: 4, is_active: true },
  { id: "55555555-5555-5555-5555-555555555555", name: "Kitchen & Daily Needs", slug: "kitchen", icon: "Utensils", sort_order: 5, is_active: true },
  { id: "66666666-6666-6666-6666-666666666666", name: "Furniture & Decor", slug: "furniture", icon: "Armchair", sort_order: 6, is_active: true },
  { id: "77777777-7777-7777-7777-777777777777", name: "Travel, Bags & Vehicles", slug: "travel", icon: "Car", sort_order: 7, is_active: true },
  { id: "88888888-8888-8888-8888-888888888888", name: "Services & Neighbor Help", slug: "services", icon: "Handshake", sort_order: 8, is_active: true },
];

async function seed() {
  console.log("Seeding categories into Supabase...");
  const { data, error } = await supabase
    .from("categories")
    .upsert(DEFAULT_CATEGORIES, { onConflict: "slug" })
    .select();

  if (error) {
    console.error("Error seeding categories:", error);
  } else {
    console.log("Successfully seeded categories:", data.length);
  }
}

seed();
