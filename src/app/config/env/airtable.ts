import z from 'zod';

// Airtable ID regex patterns
const AIRTABLE_API_KEY_REGEX = /^pat[A-Za-z0-9.]{79}$/;
const AIRTABLE_BASE_ID_REGEX = /^app[A-Za-z0-9]{14}$/;
const AIRTABLE_TABLE_ID_REGEX = /^tbl[A-Za-z0-9]{14}$/;

// Reusable Airtable ID schemas
const airtableApiKeySchema = z
  .string()
  .min(1, 'AIRTABLE_API_KEY is required for Airtable API access')
  .regex(
    AIRTABLE_API_KEY_REGEX,
    'AIRTABLE_API_KEY must be a valid Airtable Personal Access Token format (starts with "pat" followed by 79 characters, can contain dots)'
  );

const airtableBaseIdSchema = z
  .string()
  .min(1, 'AIRTABLE_BASE_ID is required for Airtable base access')
  .regex(
    AIRTABLE_BASE_ID_REGEX,
    'AIRTABLE_BASE_ID must be a valid Airtable base ID format (starts with "app" followed by 14 characters)'
  );

const airtableTableIdSchema = z
  .string()
  .min(1, 'Table ID is required for Airtable table access')
  .regex(
    AIRTABLE_TABLE_ID_REGEX,
    'Table ID must be a valid Airtable table ID format (starts with "tbl" followed by 14 characters)'
  );

export const airtableEnvSchema = z.object({
  AIRTABLE_API_KEY: airtableApiKeySchema,
  AIRTABLE_BASE_ID: airtableBaseIdSchema,
  AIRTABLE_PERSONA_TABLE_ID: airtableTableIdSchema,
  AIRTABLE_GAMES_TABLE_ID: airtableTableIdSchema,
  AIRTABLE_PLATFORMS_TABLE_ID: airtableTableIdSchema,
});
