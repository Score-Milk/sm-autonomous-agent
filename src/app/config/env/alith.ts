import z from "zod";

export const alithEnvSchema = z.object({
  OPENAI_API_KEY: z.string(),
});

