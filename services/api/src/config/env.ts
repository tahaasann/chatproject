import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  HOST: z.string().default("0.0.0.0"),
  PORT: z.coerce.number().int().positive().default(3001),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://localhost:3000")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().min(1).optional(),
  CHAT_PROVIDER: z
    .enum(["echo", "openai", "anthropic", "google", "xai"])
    .default("echo"),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().default("claude-3-5-sonnet-20240620"),
  GOOGLE_API_KEY: z.string().min(1).optional(),
  GOOGLE_MODEL: z.string().default("gemini-2.5-flash"),
  XAI_API_KEY: z.string().min(1).optional(),
  XAI_MODEL: z.string().default("grok-2-latest"),
  QWEN_API_KEY: z.string().min(1).optional(),
  QWEN_MODEL: z.string().default("qwen-plus"),
  ZAI_API_KEY: z.string().min(1).optional(),
  ZAI_MODEL: z.string().default("glm-4-flash"),
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // Bootstrap runs before Pino exists — console.error is acceptable here.
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;

/** Stable dev user until JWT auth (T-091+). */
export const DEV_FALLBACK_USER_ID = "00000000-0000-0000-0000-000000000000";

export const isSupabaseEnabled = Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
