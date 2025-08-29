import type { PersonasRepository } from '../../../infra/database/repositories/personas';
import { env } from '../../config/env';

export class PersonaManager {
  private refreshInterval: NodeJS.Timeout | null = null;

  constructor(private readonly personasRepository: PersonasRepository) {}

  async initialize(): Promise<void> {
    await this.refreshData();

    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(
      () => this.refreshData(),
      env.PERSONA_MANAGER_REFRESH_INTERVAL
    );

    // biome-ignore-start lint/style/noMagicNumbers: this is just for better logging
    console.log(
      `PersonaManager initialized and data will refresh every ${
        env.PERSONA_MANAGER_REFRESH_INTERVAL / 60 / 1000
      } ${env.PERSONA_MANAGER_REFRESH_INTERVAL > 1000 ? 'minutes' : 'seconds'}`
    );
    // biome-ignore-end lint/style/noMagicNumbers: this is just for better logging
  }

  private async refreshData(): Promise<void> {
    try {
      await this.personasRepository.refreshData();
      console.log('PersonaManager refreshed data in repository');
    } catch (error) {
      console.error('Failed to refresh data in repository:', error);
    }
  }

  public stopRefreshing(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('PersonaManager stopped refreshing data');
    }
  }
}
