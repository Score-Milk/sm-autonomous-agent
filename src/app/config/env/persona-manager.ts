import z from 'zod';

export const personaManagerEnvSchema = z.object({
  PERSONA_MANAGER_REFRESH_INTERVAL: z.string().transform((v) => Number(v)),
});
