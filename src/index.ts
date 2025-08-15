import { Elysia } from 'elysia';
import { chatRouter } from './infra/http/chat';

const app = new Elysia()
  .get('/health', () => 'OK')
  .use(chatRouter)
  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
