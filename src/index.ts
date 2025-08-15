import { Elysia, t } from 'elysia';
import { Agent, WindowBufferMemory } from 'alith';
import { createMessage } from './utils';
import { AGENT_NAME } from './constants';

interface Chat {
  agent: Agent;
}

const chats: Record<string, Chat> = {};

function getChat(chatId: string) {
  return (chats[chatId] ??= {
    agent: new Agent({
      model: 'gpt-4o',
      preamble: `
You are ${AGENT_NAME}, the gamer mascot of Score Milk, a Web3 decentralized online gaming platform. Respond to messages with relevant information and maintain the context of the conversation.
Always reply in a single line. Do not use markdown formatting, just plain text. Keep your responses small, but playfula. Do not use emojis or any other special characters.
Within the message, you might see a line that starts with "[SYSTEM]:", treat it as a system message, not a user message. The system messages can give you context and also give commands. If the system message is a command, behave accordingly. Other lines without "[SYSTEM]:" in the same message are user messages.
      `,
      memory: new WindowBufferMemory(),
    }),
  });
}

const app = new Elysia()
  .get('/health', () => 'OK')
  .ws('/ws', {
    query: t.Object({
      chatId: t.String(),
      userId: t.String(),
      gameId: t.String(),
    }),
    body: t.Object({
      message: t.String(),
    }),

    open: async (ws) => {
      const chat = getChat(ws.data.query.chatId);

      const response = await chat.agent.prompt(`
[SYSTEM]: You are playing a match of chess.
[SYSTEM]: Send a small welcome message to the user.
      `);

      ws.send(createMessage(response, AGENT_NAME, ws.data.query.gameId));
    },
    close: (ws) => delete chats[ws.data.query.chatId],

    async message(ws, { message }) {
      const chat = getChat(ws.data.query.chatId);

      const response = await chat.agent.prompt(message);
      ws.send(createMessage(response, AGENT_NAME, ws.data.query.gameId));
    },
  })
  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
