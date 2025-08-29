import Airtable from 'airtable';
import type { QueryParams } from 'airtable/lib/query_params';
import { env } from '../../../app/config/env';
import type {
  Game,
  Persona,
  PersonaLoader,
  Platform,
} from '../../../app/models/persona-manager/types';
import { SimpleCache } from '../../../app/utils/cache';
import { withRetry } from '../../../app/utils/retry';
import { normalizeUrl } from '../../../app/utils/url';
import type { PersonasRepository } from '../../database/repositories/personas';
import type {
  AirtableGameRecord,
  AirtablePersonaRecord,
  AirtablePlatformRecord,
} from './schemas';
import { gameSchema, personaSchema, platformSchema } from './schemas';

export class AirtableProvider implements PersonaLoader, PersonasRepository {
  private readonly airtable: Airtable;
  private readonly base: Airtable.Base;
  private readonly cache: SimpleCache;

  constructor() {
    this.airtable = new Airtable({ apiKey: env.AIRTABLE_API_KEY });
    this.base = this.airtable.base(env.AIRTABLE_BASE_ID);
    this.cache = new SimpleCache();
  }

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
        .filter(Boolean) as ReturnType<(typeof personaSchema)['parse']>[];

      this.cache.set(cacheKey, validatedRecords);

      const personaMap = validatedRecords.reduce<Record<string, Persona>>(
        (acc, persona) => {
          acc[persona.name] = persona;
          return acc;
        },
        {}
      );
      this.cache.set('personas-by-name', personaMap);

      return validatedRecords;
    } catch (error) {
      console.error('Failed to get personas from Airtable:', error);

      throw new Error(
        `Failed to get personas: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getPersonaByName(name: string): Promise<Persona | undefined> {
    let personaMap =
      this.cache.get<Record<string, Persona>>('personas-by-name');
    if (!personaMap) {
      await this.getPersonas();
      personaMap = this.cache.get<Record<string, Persona>>('personas-by-name');
    }
    return personaMap?.[name];
  }

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
        .filter(Boolean) as ReturnType<(typeof gameSchema)['parse']>[];

      this.cache.set(cacheKey, validatedRecords);

      const gameMap = validatedRecords.reduce<Record<string, Game>>(
        (acc, game) => {
          acc[game.alias] = game;
          return acc;
        },
        {}
      );
      this.cache.set('games-by-alias', gameMap);

      return validatedRecords;
    } catch (error) {
      console.error('Failed to get games from Airtable:', error);

      throw new Error(
        `Failed to get games: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getGameByAlias(alias: string): Promise<Game | undefined> {
    let gameMap = this.cache.get<Record<string, Game>>('games-by-alias');
    if (!gameMap) {
      await this.getGames();
      gameMap = this.cache.get<Record<string, Game>>('games-by-alias');
    }
    return gameMap?.[alias];
  }

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
        .filter(Boolean) as ReturnType<(typeof platformSchema)['parse']>[];

      this.cache.set(cacheKey, validatedRecords);

      const platformMap = validatedRecords.reduce<Record<string, Platform>>(
        (acc, platform) => {
          if (!platform.url) return acc;

          try {
            const normalizedUrl = normalizeUrl(platform.url);
            if (!normalizedUrl) return acc;

            acc[normalizedUrl] = platform;
          } catch (error) {
            console.warn(
              `Invalid URL for platform "${platform.name}": ${platform.url}`,
              error
            );
          }

          return acc;
        },
        {}
      );
      this.cache.set('platforms-by-url', platformMap);

      return validatedRecords;
    } catch (error) {
      console.error('Failed to get platforms from Airtable:', error);

      throw new Error(
        `Failed to get platforms: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async getPlatformByUrl(url: string): Promise<Platform | undefined> {
    let platformMap =
      this.cache.get<Record<string, Platform>>('platforms-by-url');
    if (!platformMap) {
      await this.getPlatforms();
      platformMap =
        this.cache.get<Record<string, Platform>>('platforms-by-url');
    }

    try {
      const normalizedUrl = normalizeUrl(url);
      if (!normalizedUrl) return;

      return platformMap?.[normalizedUrl];
    } catch (error) {
      console.warn(`Invalid URL for platform lookup: ${url}`, error);
      return;
    }
  }

  async refreshData(): Promise<void> {
    this.invalidateCache();

    await Promise.all([
      this.getPersonas(),
      this.getGames(),
      this.getPlatforms(),
    ]);

    console.log('AirtableProvider refreshed all data');
  }

  invalidateCache(key?: string) {
    if (key) {
      this.cache.delete(key);
      return;
    }

    this.cache.clear();
  }
}
