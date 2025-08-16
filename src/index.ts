import { Elysia } from 'elysia';
import { chatRouter } from './infra/http/chat';
import { personaManager } from './app/models/persona-manager';
import { env } from './app/config/env';

async function start() {
  await personaManager.initialize();

  const app = new Elysia()
    .get('/health', () => 'OK')
    .use(chatRouter)
    .listen(env.PORT);

  console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
  );
}

start();
