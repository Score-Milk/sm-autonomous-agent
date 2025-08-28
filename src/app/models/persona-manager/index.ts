import { env } from '../../config/env';
import { normalizeUrl } from '../../utils/url';
import type { Game, Persona, PersonaLoader, Platform } from './types';

export class PersonaManager {
  private refreshInterval: NodeJS.Timeout | null = null;

  public personas: Record<Persona['name'], string> = {};
  public games: Record<Game['name'], string> = {};
  public platforms: Record<string, Platform> = {};

  constructor(private readonly personaLoader: PersonaLoader) {}

  async initialize(): Promise<void> {
    await this.setup();

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(
      () => this.setup(),
      env.PERSONA_MANAGER_REFRESH_INTERVAL
    );

    // biome-ignore-start lint/style/noMagicNumbers: this is just for better logging
    console.log(
      `PersonaManager initialized and persona will refresh every ${
        env.PERSONA_MANAGER_REFRESH_INTERVAL / 60 / 1000
      } ${env.PERSONA_MANAGER_REFRESH_INTERVAL > 1000 ? 'minutes' : 'seconds'}`
    );
    // biome-ignore-end lint/style/noMagicNumbers: this is just for better logging
  }

  private async setup(): Promise<void> {
    try {
      const personasTemplates = await this.personaLoader.getPersonas();

      this.personas = personasTemplates.reduce((acc, persona) => {
        acc[persona.name] = `
          ${persona.template}

          Always respond in character, as ${persona.name}.
          You may receive a message beginning with "[SYSTEM]:" at any time. This is a system message, treat it as such. It will provide context or command an action, behave accordingly.
          If you should not or don't want to reply to a message, respond with "[NOREPLY]".
        `;
        return acc;
      }, this.personas);
    } catch (error) {
      console.error('Failed to refresh persona template:', error);
    }

    try {
      const games = await this.personaLoader.getGames();
      this.games = games.reduce((acc, game) => {
        acc[game.name] = game.instructions;
        return acc;
      }, this.games);
    } catch (error) {
      console.error('Failed to refresh games instructions:', error);
    }

    try {
      const platforms = await this.personaLoader.getPlatforms();
      this.platforms = platforms.reduce((acc, platform) => {
        if (!platform.url) {
          console.warn(`Platform ${platform.name} has no URL, skipping`);
          return acc;
        }

        try {
          const normalizedUrl = normalizeUrl(platform.url);
          if (normalizedUrl) {
            acc[normalizedUrl] = platform;
          }
        } catch (error) {
          console.warn(
            `Invalid URL for platform ${platform.name}: ${platform.url}`,
            error
          );
        }

        return acc;
      }, this.platforms);
    } catch (error) {
      console.error('Failed to refresh platform data:', error);
    }
  }
}
