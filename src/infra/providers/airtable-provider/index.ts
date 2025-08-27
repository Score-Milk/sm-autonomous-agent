import Airtable from 'airtable';
import type { QueryParams } from 'airtable/lib/query_params';
import { env } from '../../../app/config/env';
import type { PersonaLoader } from '../../../app/models/persona-manager/types';
import { SimpleCache } from '../../../app/utils/cache';
import { withRetry } from '../../../app/utils/retry';
import type {
  AirtableGameRecord,
  AirtablePersonaRecord,
  AirtablePlatformRecord,
  Game,
  Persona,
  Platform,
} from './schemas';
import {
  gameSchema,
  gamesArraySchema,
  personaSchema,
  personasArraySchema,
  platformSchema,
  platformsArraySchema,
} from './schemas';

export class AirtableProvider implements PersonaLoader {
  private readonly airtable: Airtable;
  private readonly base: Airtable.Base;
  private readonly cache: SimpleCache;

  constructor() {
    this.airtable = new Airtable({ apiKey: env.AIRTABLE_API_KEY });
    this.base = this.airtable.base(env.AIRTABLE_BASE_ID);
    this.cache = new SimpleCache();
  }

  /**
   * Get a specific table by ID
   */
  getTable(tableId: string) {
    return this.base.table(tableId);
  }

  /**
   * Generic method to get records from any table with error handling
   */
  async getRecords<T = Record<string, unknown>>(
    tableId: string,
    params: QueryParams<Airtable.FieldSet> = {}
  ): Promise<T[]> {
    const result = await withRetry(async () => {
      const table = this.getTable(tableId);
      const query = table.select(params);
      const records = await query.all();

      return records.map((record) => ({
        id: record.id,
        ...record.fields,
      })) as T[];
    }, `getRecords from table ${tableId}`);

    if (!result) {
      throw new Error(`Failed to get records from table ${tableId}`);
    }

    return result;
  }

  /**
   * get persona data from the Personas table
   */
  async getPersonas(): Promise<Persona[]> {
    const cacheKey = 'airtable-personas';
    const cached = this.cache.get<Persona[]>(cacheKey);
    if (cached) return cached;

    try {
      const records = await this.getRecords<AirtablePersonaRecord>(
        env.AIRTABLE_PERSONA_TABLE_ID,
        {
          filterByFormula: '{Is Active} = 1',
          sort: [{ field: 'Name', direction: 'asc' }],
        }
      );

      const validatedRecords = records
        .map((record) => {
          const persona = personaSchema.safeParse(record);
          if (!persona.success) {
            console.warn('Invalid persona record:', record, persona.error);
            return null;
          }

          return persona.data;
        })
        .filter(Boolean);

      const validatedResult = personasArraySchema.parse(validatedRecords);
      this.cache.set(cacheKey, validatedResult);
      return validatedResult;
    } catch (error) {
      console.error('Failed to get personas from Airtable:', error);

      throw new Error(
        `Failed to get personas: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * get games data from the Games table
   */
  async getGames(): Promise<Game[]> {
    const cacheKey = 'airtable-games';
    const cached = this.cache.get<Game[]>(cacheKey);
    if (cached) return cached;

    try {
      const records = await this.getRecords<AirtableGameRecord>(
        env.AIRTABLE_GAMES_TABLE_ID,
        {
          filterByFormula: '{Is Active} = 1',
          sort: [{ field: 'Name', direction: 'asc' }],
        }
      );

      const validatedRecords = records
        .map((record) => {
          const game = gameSchema.safeParse(record);
          if (!game.success) {
            console.warn('Invalid game record:', record, game.error);
            return null;
          }

          return game.data;
        })
        .filter(Boolean);

      const validatedResult = gamesArraySchema.parse(validatedRecords);
      this.cache.set(cacheKey, validatedResult);
      return validatedResult;
    } catch (error) {
      console.error('Failed to get games from Airtable:', error);

      throw new Error(
        `Failed to get games: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * get platforms data from the Platforms table
   */
  async getPlatforms(): Promise<Platform[]> {
    const cacheKey = 'airtable-platforms';
    const cached = this.cache.get<Platform[]>(cacheKey);
    if (cached) return cached;

    try {
      const records = await this.getRecords<AirtablePlatformRecord>(
        env.AIRTABLE_PLATFORMS_TABLE_ID,
        {
          filterByFormula: '{Is Active} = 1',
          sort: [{ field: 'Name', direction: 'asc' }],
        }
      );

      const validatedRecords = records
        .map((record) => {
          const platform = platformSchema.safeParse(record);
          if (!platform.success) {
            console.warn('Invalid platform record:', record, platform.error);
            return null;
          }

          return platform.data;
        })
        .filter(Boolean);

      const validatedResult = platformsArraySchema.parse(validatedRecords);
      this.cache.set(cacheKey, validatedResult);
      return validatedResult;
    } catch (error) {
      console.error('Failed to get platforms from Airtable:', error);

      throw new Error(
        `Failed to get platforms: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clear all cached data
   */
  invalidateCache(key?: string) {
    if (key) {
      this.cache.delete(key);
      return;
    }

    this.cache.clear();
  }
}
