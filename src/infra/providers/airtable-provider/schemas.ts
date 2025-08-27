import { z } from 'zod';

// Personas
export const personaSchema = z
  .object({
    id: z.string(),
    Name: z.string().optional(),
    Description: z.string().optional(),
    Template: z.string().optional(),
    'Is Active': z.boolean().optional(),
    'Created At': z.string().optional(),
    'Updated At': z.string().optional(),
  })
  .transform((persona) => ({
    id: persona.id,
    name: persona.Name || '',
    description: persona.Description || '',
    template: persona.Template || '',
    isActive: persona['Is Active'] ?? true,
    createdAt: persona['Created At'] || '',
    updatedAt: persona['Updated At'] || '',
  }));
export const personasArraySchema = z.array(personaSchema);

export type AirtablePersonaRecord = z.input<typeof personaSchema>;
export type Persona = z.infer<typeof personaSchema>;

// Games
export const gameSchema = z
  .object({
    id: z.string(),
    Name: z.string().optional(),
    Description: z.string().optional(),
    Instructions: z.string().optional(),
    'Is Active': z.boolean().optional(),
    'Created At': z.string().optional(),
    'Updated At': z.string().optional(),
  })
  .transform((game) => ({
    id: game.id,
    name: game.Name || '',
    description: game.Description || '',
    instructions: game.Instructions || '',
    isActive: game['Is Active'] ?? true,
    createdAt: game['Created At'] || '',
    updatedAt: game['Updated At'] || '',
  }));
export const gamesArraySchema = z.array(gameSchema);

export type AirtableGameRecord = z.input<typeof gameSchema>;
export type Game = z.infer<typeof gameSchema>;

// Platforms
export const platformSchema = z
  .object({
    id: z.string(),
    Name: z.string().optional(),
    Description: z.string().optional(),
    URL: z.string().optional(),
    'Is Active': z.boolean().optional(),
    'Created At': z.string().optional(),
    'Updated At': z.string().optional(),
  })
  .transform((platform) => ({
    id: platform.id,
    name: platform.Name || '',
    description: platform.Description || '',
    url: platform.URL || '',
    isActive: platform['Is Active'] ?? true,
    createdAt: platform['Created At'] || '',
    updatedAt: platform['Updated At'] || '',
  }));
export const platformsArraySchema = z.array(platformSchema);

export type AirtablePlatformRecord = z.input<typeof platformSchema>;
export type Platform = z.infer<typeof platformSchema>;
