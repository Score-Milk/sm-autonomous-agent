import Elysia, { t } from 'elysia';
import { Message, MessageMapper } from '../../app/models/message';
import { db } from '../database';
import { env } from '../../app/config/env';
import { personaManager } from '../../app/models/persona-manager';

export const chatRouter = new Elysia().ws('/ws', {
  query: t.Object({
    chatId: t.String(),
    userId: t.String(),
    gameName: t.String(),
  }),
  body: t.Object({
    message: t.String(),
  }),

  open: async (ws) => {
    const chat = await db.createChat(
      ws.data.query.chatId,
      ws.data.query.userId,
      ws.data.query.gameName
    );

    const gameInstructions = personaManager.gamesInstructions[ws.data.query.gameName]

    let welcomePrompt = `
      ${gameInstructions
        ? `[SYSTEM]: These are instructions for the game you're playing. Keep them for context:\n\n${gameInstructions}\n\n`
        : `[SYSTEM]: You're playing a match of ${ws.data.query.gameName}`}

      [SYSTEM]: Send a small welcome message to the user
    `

    const response = await chat.agent.prompt(welcomePrompt);

    const message = new Message(
      response,
      env.AUTONOMOUS_AGENT_NAME,
      env.AUTONOMOUS_AGENT_NAME,
      ws.data.query.gameName
    );

    ws.send(MessageMapper.toResponse(message));
  },
  close: async (ws) => {
    await db.deleteChat(ws.data.query.chatId);
  },

  async message(ws, { message }) {
    const chat = await db.getChat(ws.data.query.chatId);
    if (!chat) {
      const message = new Message(
        'Chat not found. Please reconnect to start a new chat.',
        'System',
        'System',
        ws.data.query.gameName
      );
      ws.send(MessageMapper.toResponse(message));
      return;
    }

    const response = await chat.agent.prompt(message);
    const responseMessage = new Message(
      response,
      env.AUTONOMOUS_AGENT_NAME,
      env.AUTONOMOUS_AGENT_NAME,
      ws.data.query.gameName
    );
    ws.send(MessageMapper.toResponse(responseMessage));
  },
});
