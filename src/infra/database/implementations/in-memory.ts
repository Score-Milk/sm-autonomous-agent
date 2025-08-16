import { Chat } from '../../../app/models/chat';
import { ChatsRepository } from '../repositories/chats';
import { AutonomousAgent } from '../../../app/models/autonomous-agent';

export class InMemoryDatabase implements ChatsRepository {
  private chats: Record<string, Chat> = {};

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
    gameId: string
  ): Promise<Chat> {
    const autonomousAgent = new AutonomousAgent();

    const chat = new Chat(chatId, userId, gameId, autonomousAgent.agent);

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
