import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Generate a random 6-character alphanumeric share ID
function generateShortId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

interface SharedRoastPayload {
  roast: string;
  theme: "cyberpunk" | "inferno" | "toxic";
  name: string;
  mode: string;
  createdAt?: string;
}

// Local File Database Helper (fallback for local development)
const getLocalDbPath = () => path.join(process.cwd(), "data", "shared_roasts.json");

function readLocalDb(): Record<string, SharedRoastPayload> {
  try {
    const filePath = getLocalDbPath();
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local db file", err);
    return {};
  }
}

function writeLocalDb(db: Record<string, SharedRoastPayload>) {
  try {
    const filePath = getLocalDbPath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to local db file", err);
  }
}

// KV Helper
async function saveToKv(id: string, payload: SharedRoastPayload): Promise<boolean> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return false;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["set", `roast:${id}`, JSON.stringify(payload)]),
    });
    if (!response.ok) {
      throw new Error(`Upstash response status ${response.status}`);
    }
    const data = await response.json();
    return data && data.result === "OK";
  } catch (err) {
    console.error("Failed to save to Vercel KV / Upstash Redis:", err);
    return false;
  }
}

async function getFromKv(id: string): Promise<SharedRoastPayload | null> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["get", `roast:${id}`]),
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data && data.result) {
      return JSON.parse(data.result);
    }
    return null;
  } catch (err) {
    console.error("Failed to get from Vercel KV / Upstash Redis:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roast, theme, name, mode } = body;
    if (!roast) {
      return NextResponse.json({ error: "Roast content is required" }, { status: 400 });
    }

    const payload: SharedRoastPayload = { roast, theme, name, mode, createdAt: new Date().toISOString() };
    const id = generateShortId();

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (url && token) {
      // Production path - Cloud KV Storage
      const success = await saveToKv(id, payload);
      if (!success) {
        return NextResponse.json({ error: "Database storage failed" }, { status: 500 });
      }
    } else {
      // Development/Local path - File Storage
      const db = readLocalDb();
      db[id] = payload;
      writeLocalDb(db);
    }

    return NextResponse.json({ id });
  } catch (err) {
    console.error("Share POST route error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || id.length > 10) {
      return NextResponse.json({ error: "Invalid ID parameter" }, { status: 400 });
    }

    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    let payload: SharedRoastPayload | null = null;

    if (url && token) {
      payload = await getFromKv(id);
    } else {
      const db = readLocalDb();
      payload = db[id] || null;
    }

    if (!payload) {
      return NextResponse.json({ error: "Shared roast not found" }, { status: 404 });
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Share GET route error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
