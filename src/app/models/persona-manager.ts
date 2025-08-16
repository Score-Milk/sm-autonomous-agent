import fs from 'fs/promises';
import path from 'path';

import { env } from '../config/env';

class PersonaManager {
  private static instance: PersonaManager;
  public personaTemplate = '';
  private readonly refreshInterval = env.PERSONA_MANAGER_REFRESH_INTERVAL;
  private intervalId: NodeJS.Timeout | null = null;

  private constructor() { }

  public static getInstance(): PersonaManager {
    if (!PersonaManager.instance) {
      PersonaManager.instance = new PersonaManager();
    }
    return PersonaManager.instance;
  }

  public async initialize(): Promise<void> {
    const personaTemplate = await this.fetchPersonaTemplate();
    if (!personaTemplate) {
      throw new Error('Failed to load persona template. Please ensure the persona file exists.');
    }
    this.personaTemplate = personaTemplate;

    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.intervalId = setInterval(() => this.refreshPersona(), this.refreshInterval);
    console.log(`PersonaManager initialized and persona will refresh every ${env.PERSONA_MANAGER_REFRESH_INTERVAL / 60 / 1000} ${env.PERSONA_MANAGER_REFRESH_INTERVAL > 1000 ? 'minutes' : 'seconds'}.`);
  }

  private async refreshPersona(): Promise<void> {
    try {
      const personaTemplate = await this.fetchPersonaTemplate();
      if (!personaTemplate) {
        console.warn('Failed to refresh persona template. Using existing template.');
        return;
      }
      this.personaTemplate = personaTemplate;
      console.log('Persona template refreshed.');
    } catch (error) {
      console.error('Failed to refresh persona template:', error);
    }
  }

  async fetchPersonaTemplate(): Promise<string | null> {
    const personaPath = path.resolve(process.cwd(), 'character', 'persona.txt');
    try {
      return await fs.readFile(personaPath, 'utf-8');
    } catch (error) {
      console.warn(`Failed to load persona from ${personaPath}. Falling back to default persona.`, error);
      return null
    }
  }
}

export const personaManager = PersonaManager.getInstance();
