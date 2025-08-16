import z from "zod";

export const autonomousAgentEnvSchema = z.object({
  AUTONOMOUS_AGENT_NAME: z.string().default('MilkMan')
})
