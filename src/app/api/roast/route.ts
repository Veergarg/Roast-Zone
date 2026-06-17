import { NextRequest, NextResponse } from "next/server";
import { generateRoast } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode, data } = body;

    let prompt = "";
    const spice = data.spice || "spicy";

    if (mode === "github") {
      prompt = `You are a savage but funny roast comedian. Roast this GitHub profile brutally but keep it constructive and fun — never mean or offensive.

GitHub User: ${data.name || data.login}
Bio: ${data.bio || "No bio — already suspicious"}
Public Repos: ${data.public_repos}
Followers: ${data.followers}
Following: ${data.following}
Account Created: ${data.created_at}
Top Languages: ${data.languages?.join(", ") || "Unknown"}
Total Stars: ${data.stars || 0}

Write a 4-6 sentence roast. Be funny, specific to their stats, and end with one genuine piece of advice. Use emojis.`;
    }

    if (mode === "personal") {
      prompt = `You are a savage but funny roast comedian. Roast this person brutally but keep it fun and friendly — never mean or offensive.

Name: ${data.name}
Occupation: ${data.occupation}
Fun Facts: ${data.facts}
Bio: ${data.bio || "No bio provided"}

Write a 4-6 sentence roast. Be funny, creative, and end with one genuine compliment. Use emojis.`;
    }

    if (mode === "resume") {
      prompt = `You are a savage but funny roast comedian. Roast this professional resume and career summary brutally but keep it fun — never mean or offensive.

Name: ${data.name}
Current/Target Role: ${data.role}
Career/Resume Summary: ${data.summary}
Achievements: ${data.achievements || "None listed — suspect"}

Write a 4-6 sentence roast focusing on corporate buzzwords, self-promotional fluff, resume cliches, and their achievements. End with one funny, sarcastic piece of career advice. Use emojis.`;
    }

    let spiceInstruction = "";
    if (spice === "mild") {
      spiceInstruction = "\n\nRoast severity: MILD. Keep it gentle, warm, and lighthearted. Use soft, friendly teasing. Never be overly harsh. Make sure the joke is mild.";
    } else if (spice === "spicy") {
      spiceInstruction = "\n\nRoast severity: SPICY. Standard sarcastic humor, sharp, witty, and funny. Point out funny stats or inconsistencies.";
    } else if (spice === "nuclear") {
      spiceInstruction = "\n\nRoast severity: NUCLEAR. Highly savage, biting, and hilarious. Call out flaws or stats with zero hesitation. Push the boundaries of comedic roast.";
    } else if (spice === "extreme") {
      spiceInstruction = "\n\nRoast severity: CAREER ENDING. Deliver absolute emotional damage. Go fully savage. Point out every single flaw, weird stat, or self-delusion with devastating comedic severity. Keep it extremely brutal and mercilessly funny.";
    }

    prompt += spiceInstruction;

    const roast = await generateRoast(prompt);
    return NextResponse.json({ roast });
 } catch (error) {
    console.error("Roast API Error:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: "Failed to generate roast" },
      { status: 500 }
    );
  }
}

