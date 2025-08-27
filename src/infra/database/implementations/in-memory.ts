/** biome-ignore-all lint/suspicious/useAwait: this is a in-memory database */

import { AutonomousAgent } from '../../../app/models/autonomous-agent';
import { Chat } from '../../../app/models/chat';
import type { PersonaManager } from '../../../app/models/persona-manager';
import type { ChatsRepository } from '../repositories/chats';

export class InMemoryDatabase implements ChatsRepository {
  private readonly chats: Record<string, Chat> = {};

  constructor(private readonly personaManager: PersonaManager) {}

  async getChat(chatId: string): Promise<Chat | null> {
    const chat = this.chats[chatId];
    if (!chat) {
      throw new Error(`Chat with ID ${chatId} does not exist.`);
    }

    return chat;
  }

  async createChat(
    chatId: string,
    userId: string,
    gameName: string
  ): Promise<Chat> {
    const autonomousAgent = new AutonomousAgent(this.personaManager);

    const chat = new Chat(chatId, userId, gameName, autonomousAgent.agent);

    this.chats[chatId] = chat;
    return chat;
  }

  async deleteChat(chatId: string): Promise<void> {
    if (this.chats[chatId]) {
      delete this.chats[chatId];
    } else {
      throw new Error(`Chat with ID ${chatId} does not exist.`);
    }
  }
}
