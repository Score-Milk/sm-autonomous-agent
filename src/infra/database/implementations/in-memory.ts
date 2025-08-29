/** biome-ignore-all lint/suspicious/useAwait: this is a in-memory database */
import { AutonomousAgent } from '../../../app/models/autonomous-agent';
import { Chat } from '../../../app/models/chat';
import type {
  Game,
  Persona,
  Platform,
} from '../../../app/models/persona-manager/types';
import { SimpleCache } from '../../../app/utils/cache';
import { normalizeUrl } from '../../../app/utils/url';
import type { ChatsRepository } from '../repositories/chats';
import type { PersonasRepository } from '../repositories/personas';

type PersonasCache = Record<Persona['name'], Persona>;
type GamesCache = Record<Game['alias'], Game>;
type PlatformsCache = Record<Platform['url'], Platform>;

export class InMemoryDatabase implements ChatsRepository, PersonasRepository {
  private readonly chats: Record<string, Chat> = {};
  private readonly cache = new SimpleCache();

  constructor(private readonly personasRepository: PersonasRepository) {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.refreshData();
  }

  // ChatsRepository implementation
  async getChat(chatId: string): Promise<Chat | null> {
    const chat = this.chats[chatId];
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} does not exist.`);
    }

    return chat;
  }

  async createChat(
    chatId: string,
    userId: string,
    gameName: string
  ): Promise<Chat> {
    const autonomousAgent = new AutonomousAgent(this);

    const chat = new Chat(chatId, userId, gameName, autonomousAgent.agent);

    this.chats[chatId] = chat;
    return chat;
  }

  async deleteChat(chatId: string): Promise<void> {
    if (this.chats[chatId]) {
      delete this.chats[chatId];
    } else {
      throw new Error(`Chat with ID ${chatId} does not exist.`);
    }
  }

  // PersonasRepository implementation
  async getPersonas(): Promise<Persona[]> {
    const key = 'personas';
    const cached = this.cache.get<PersonasCache>(key);
    if (cached) {
      return Object.values(cached);
    }

    await this.refreshData();
    const data = this.cache.get<PersonasCache>(key) || {};
    return Object.values(data);
  }

  async getGames(): Promise<Game[]> {
    const key = 'games';
    const cached = this.cache.get<GamesCache>(key);
    if (cached) {
      return Object.values(cached);
    }

    await this.refreshData();
    const data = this.cache.get<GamesCache>(key) || {};
    return Object.values(data);
  }

  async getPlatforms(): Promise<Platform[]> {
    const key = 'platforms';
    const cached = this.cache.get<PlatformsCache>(key);
    if (cached) {
      return Object.values(cached);
    }

    await this.refreshData();
    const data = this.cache.get<PlatformsCache>(key) || {};
    return Object.values(data);
  }

  async getPersonaByName(name: string): Promise<Persona | undefined> {
    const personas = await this.getPersonas();
    return personas.find((p) => p.name === name);
  }

  async getGameByAlias(alias: string): Promise<Game | undefined> {
    const games = await this.getGames();
    return games.find((g) => g.alias === alias);
  }

  async getPlatformByUrl(url: string): Promise<Platform | undefined> {
    const platforms = await this.getPlatforms();
    const normalized = normalizeUrl(url);
    return platforms.find((p) => normalizeUrl(p.url) === normalized);
  }

  async refreshData(): Promise<void> {
    // Clear existing keys to re-fetch
    this.cache.delete('personas');
    this.cache.delete('games');
    this.cache.delete('platforms');

    try {
      const [personas, games, platforms] = await Promise.all([
        this.personasRepository.getPersonas(),
        this.personasRepository.getGames(),
        this.personasRepository.getPlatforms(),
      ]);

      const personasMap = personas.reduce((acc, persona) => {
        acc[persona.name] = persona;
        return acc;
      }, {} as PersonasCache);

      const gamesMap = games.reduce((acc, game) => {
        acc[game.alias] = game;
        return acc;
      }, {} as GamesCache);

      const platformsMap = platforms.reduce((acc, platform) => {
        if (!platform.url) return acc;

        const url = normalizeUrl(platform.url);
        if (!url) return acc;

        acc[url] = platform;
        return acc;
      }, {} as PlatformsCache);

      this.cache.set('personas', personasMap);
      this.cache.set('games', gamesMap);
      this.cache.set('platforms', platformsMap);

      console.log('In-memory database refreshed persona data');
    } catch (error) {
      console.error('Failed to refresh in-memory database:', error);
    }
  }
}
