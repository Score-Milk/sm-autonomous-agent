import Elysia, { t } from 'elysia';
import { Message, MessageMapper } from '../../app/models/message';
import { Milkman } from '../../app/models/milkman';
import { db } from '../database';

export const chatRouter = new Elysia().ws('/ws', {
  query: t.Object({
    userId: t.String(),
    gameId: t.String(),
    chatId: t.String(),
  }),
  body: t.Object({
    message: t.String(),
  }),

  open: async (ws) => {
    const chat = await db.createChat(
      ws.data.query.chatId,
      ws.data.query.userId,
      ws.data.query.gameId
    );

    const response = await chat.agent.prompt(`
[SYSTEM]: You are playing a match of chess.
[SYSTEM]: Send a small welcome message to the user.
    `);

    const message = new Message(
      response,
      Milkman.AGENT_NAME,
      Milkman.AGENT_NAME,
      ws.data.query.gameId
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
        ws.data.query.gameId
      );
      ws.send(MessageMapper.toResponse(message));
      return;
    }

    const response = await chat.agent.prompt(message);
    const responseMessage = new Message(
      response,
      Milkman.AGENT_NAME,
      Milkman.AGENT_NAME,
      ws.data.query.gameId
    );
    ws.send(MessageMapper.toResponse(responseMessage));
  },
});
