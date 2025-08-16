import fs from 'fs/promises';
import path from 'path';

import { env } from '../config/env';

class PersonaManager {
  private static instance: PersonaManager;
  private refreshInterval: NodeJS.Timeout | null = null;

  public personaTemplate = '';
  public gamesInstructions: Record<string, string> = {};

  private constructor() { }

  public static getInstance(): PersonaManager {
    if (!PersonaManager.instance) {
      PersonaManager.instance = new PersonaManager();
    }
    return PersonaManager.instance;
  }

  public async initialize(): Promise<void> {
    this.setup();

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }

    this.refreshInterval = setInterval(() => this.setup(), env.PERSONA_MANAGER_REFRESH_INTERVAL);
    console.log(`PersonaManager initialized and persona will refresh every ${env.PERSONA_MANAGER_REFRESH_INTERVAL / 60 / 1000} ${env.PERSONA_MANAGER_REFRESH_INTERVAL > 1000 ? 'minutes' : 'seconds'}`);
  }

  private async setup(): Promise<void> {
    try {
      const personaTemplate = await this.fetchPersonaTemplate();
      if (!personaTemplate) {
        console.warn('Failed to refresh persona template. Using existing template');
        return;
      }
      this.personaTemplate = `
        ${personaTemplate}

        You may receive a message beginning with "[SYSTEM]:" at any time. This is a system message, treat it as such. It will provide context or command an action, behave accordingly.
      `;

      const chaosChessInstructions = await this.fetchChaosChessInstructions();
      if (chaosChessInstructions) this.gamesInstructions['chaoschess'] = chaosChessInstructions;
    } catch (error) {
      console.error('Failed to refresh persona template:', error);
    }
  }

  async fetchPersonaTemplate(): Promise<string | null> {
    const personaPath = path.resolve(process.cwd(), 'character', 'persona.txt');
    try {
      return await fs.readFile(personaPath, 'utf-8');
    } catch (error) {
      console.warn(`Failed to load persona from ${personaPath}. Falling back to default persona`, error);
      return null
    }
  }

  async fetchChaosChessInstructions(): Promise<string | null> {
    const instructionsPath = path.resolve(process.cwd(), 'character', 'games', 'chaos_chess.txt');
    try {
      return await fs.readFile(instructionsPath, 'utf-8');
    } catch (error) {
      console.warn(`Failed to load chaos chess instructions from ${instructionsPath}`, error);
      return null
    }
  }
}

export const personaManager = PersonaManager.getInstance();
