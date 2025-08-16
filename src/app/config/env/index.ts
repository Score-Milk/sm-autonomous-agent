import z from "zod";

import { autonomousAgentEnvSchema } from "./autonomous-agent";
import { alithEnvSchema } from "./alith";
import { personaManagerEnvSchema } from "./persona-manager";

const baseEnvSchema = z.object({
  PORT: z.string().transform(Number).default(8080)
})

export const envSchema = baseEnvSchema
  .extend(autonomousAgentEnvSchema.shape)
  .extend(alithEnvSchema.shape)
  .extend(personaManagerEnvSchema.shape);

export const env = envSchema.parse(process.env);
