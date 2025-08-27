import { Elysia } from 'elysia';
import { env } from './app/config/env';
import { chatRouter } from './infra/http/chat';

const app = new Elysia()
  .get('/health', () => 'OK')
  .use(chatRouter)
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
