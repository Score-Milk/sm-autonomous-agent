import type {
  Game,
  Persona,
  Platform,
} from '../../../app/models/persona-manager/types';

export interface PersonasRepository {
  getPersonas(): Promise<Persona[]>;
  getGames(): Promise<Game[]>;
  getPlatforms(): Promise<Platform[]>;

  getPersonaByName(name: string): Promise<Persona | undefined>;
  getGameByAlias(alias: string): Promise<Game | undefined>;
  getPlatformByUrl(url: string): Promise<Platform | undefined>;

  refreshData(): Promise<void>;
}
