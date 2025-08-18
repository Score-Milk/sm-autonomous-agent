import z from 'zod';
import { alithEnvSchema } from './alith';
import { autonomousAgentEnvSchema } from './autonomous-agent';
import { personaManagerEnvSchema } from './persona-manager';

const baseEnvSchema = z.object({
  // biome-ignore lint/style/noMagicNumbers: constants can be defined here
  PORT: z.string().transform(Number).default(1221),
});

export const envSchema = baseEnvSchema
  .extend(autonomousAgentEnvSchema.shape)
  .extend(alithEnvSchema.shape)
  .extend(personaManagerEnvSchema.shape);

export const env = envSchema.parse(process.env);
