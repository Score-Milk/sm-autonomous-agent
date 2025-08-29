import Elysia, { t } from 'elysia';
import { db } from '../..';
import { env } from '../../app/config/env';
import { Message, MessageMapper } from '../../app/models/message';
import { detectPlatform } from '../../app/utils/platform';

const NOREPLY_REGEX = /^\s*\[NOREPLY\]\s*$/i;

export const chatRouter = new Elysia({ prefix: '/chat' }).ws('/', {
  query: t.Object({
    chatId: t.String(),
    userId: t.String(),
    gameAlias: t.String(),
    platform: t.Optional(t.String()),
  }),
  body: t.Union([
    t.Object({
      message: t.String(),
    }),
    t.Object({
      data: t.Any(),
    }),
  ]),

  open: async (ws) => {
    const platforms = await db.getPlatforms();

    const { isValid, error } = detectPlatform(platforms, {
      query: ws.data.query,
      headers: ws.data.headers,
    });

    if (!isValid && error) {
      const errorMessage = new Message(
        `Connection rejected: ${error}`,
        'System',
        'System',
        ws.data.query.gameAlias
      );
      ws.send(MessageMapper.toResponse(errorMessage));
      return;
    }

    const existingChat = await db
      .getChat(ws.data.query.chatId)
      .catch(() => null);
    if (existingChat) return;

    const chat = await db.createChat(
      ws.data.query.chatId,
      ws.data.query.userId,
      ws.data.query.gameAlias
    );

    const game = await db.getGameByAlias(ws.data.query.gameAlias);

    const welcomePrompt = `
      ${
        game
          ? `[SYSTEM]: These are instructions for the game you're playing. Keep them for context:\n\n${game.instructions}`
          : `[SYSTEM]: You're playing a match of ${ws.data.query.gameAlias}. Keep that in mind for context.`
      }

      [SYSTEM]: Do not reply to these messages. This is just to set the context for the chat.
      [SYSTEM]: Send a small welcome message to the player.
    `;

    const response = await chat.agent.prompt(welcomePrompt);

    const message = new Message(
      response,
      env.AUTONOMOUS_AGENT_NAME,
      env.AUTONOMOUS_AGENT_NAME,
      ws.data.query.gameAlias
    );

    ws.send(MessageMapper.toResponse(message));
  },
  close: async (ws) => {
    await db.deleteChat(ws.data.query.chatId);
  },

  async message(ws, body) {
    if ('message' in body && body.message.toLowerCase() === 'ping') {
      ws.send({ message: 'pong' });
      return;
    }

    const chat = await db.getChat(ws.data.query.chatId);
    if (!chat) {
      const chatNotFoundMessage = new Message(
        'Chat not found. Please reconnect to start a new chat.',
        'System',
        'System',
        ws.data.query.gameAlias
      );
      ws.send(MessageMapper.toResponse(chatNotFoundMessage));
      return;
    }

    if ('data' in body && body.data) {
      const prompt = `[SYSTEM]: This event happened in the game:\n\n\`\`\`json\n${JSON.stringify(body.data)}\n\`\`\``;

      const response = await chat.agent.prompt(prompt);
      if (NOREPLY_REGEX.test(response)) {
        return;
      }

      const responseMessage = new Message(
        response,
        env.AUTONOMOUS_AGENT_NAME,
        env.AUTONOMOUS_AGENT_NAME,
        ws.data.query.gameAlias
      );
      ws.send(MessageMapper.toResponse(responseMessage));
      return;
    }

    if (!('message' in body && body.message)) {
      return;
    }

    const response = await chat.agent.prompt(body.message);
    const responseMessage = new Message(
      response,
      env.AUTONOMOUS_AGENT_NAME,
      env.AUTONOMOUS_AGENT_NAME,
      ws.data.query.gameAlias
    );
    ws.send(MessageMapper.toResponse(responseMessage));
  },
});
