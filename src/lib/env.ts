import { z } from "zod";

const envSchema = z.object({
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_AUTH_TOKEN: z.string().min(1),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().min(1),
});

const isBuildTime = process.env.NODE_ENV === "production" && !process.env.TURSO_DATABASE_URL;

export const env = isBuildTime 
  ? {
      TURSO_DATABASE_URL: "libsql://placeholder.turso.io",
      TURSO_AUTH_TOKEN: "placeholder",
      GOOGLE_GENERATIVE_AI_API_KEY: "placeholder",
      ELEVENLABS_API_KEY: "placeholder",
    }
  : envSchema.parse({
      TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
      GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    });
