import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { env } from "@/lib/env";
import { z } from "zod";

const client = new ElevenLabsClient({
  apiKey: env.ELEVENLABS_API_KEY,
});

const BodySchema = z.object({
  text: z.string().min(1).max(5000),
  voiceId: z.string().min(1).default("TX3LPaxmHKxFdv7VOQHJ"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0].message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const audioStream = await client.textToSpeech.convert(parsed.data.voiceId, {
      modelId: "eleven_turbo_v2_5",
      text: parsed.data.text,
      voiceSettings: { stability: 0.5, similarityBoost: 0.75 },
    });

    // audioStream is a ReadableStream<Uint8Array> — pass directly as Response body
    return new Response(audioStream as ReadableStream<Uint8Array>, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("[api/voice]", error);
    return new Response(JSON.stringify({ error: "Voice generation failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
