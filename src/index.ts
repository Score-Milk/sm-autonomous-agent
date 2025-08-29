import { Elysia } from 'elysia';
import { env } from './app/config/env';
import { chatRouter } from './infra/http/chat';
import { AirtableProvider } from './infra/providers/airtable-provider';
import { InMemoryDatabase } from './infra/database/implementations/in-memory';
import { PersonaManager } from './app/models/persona-manager';

export const airtableProvider = new AirtableProvider();
export const db = new InMemoryDatabase(airtableProvider);

// Auto refetch data
const personaManager = new PersonaManager(db);
personaManager.initialize();

const app = new Elysia()
  .get('/health', () => 'OK')
  .use(chatRouter)
  .listen(env.PORT)
  .onStop(() => {
    personaManager.stopRefreshing();
    console.log('🦊 Elysia has stopped');
  });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
