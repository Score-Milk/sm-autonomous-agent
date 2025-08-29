import type {
  Game,
  Persona,
  Platform,
} from '../../../app/models/persona-manager/types';

export interface PersonasRepository {
  getPersonas(): Promise<Persona[]>;
  getGames(): Promise<Game[]>;
  getPlatforms(): Promise<Platform[]>;

  getPersonaByName(name: string): Promise<Persona | null>;
  getGameByAlias(alias: string): Promise<Game | null>;
  getPlatformByUrl(url: string): Promise<Platform | null>;

  refreshData(): Promise<void>;
}
