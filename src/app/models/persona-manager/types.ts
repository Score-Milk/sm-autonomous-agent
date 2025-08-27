export interface Persona {
  id: string;
  name: string;
  description: string;
  template: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  instructions: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Platform {
  id: string;
  name: string;
  description: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PersonaLoader {
  getPersonas(): Promise<Persona[]>;
  getGames(): Promise<Game[]>;
  getPlatforms(): Promise<Platform[]>;
}
