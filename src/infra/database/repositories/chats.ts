import type { Chat } from '../../../app/models/chat';

export interface ChatsRepository {
  getChat(chatId: string): Promise<Chat | null>;
  createChat(chatId: string, userId: string, gameName: string): Promise<Chat>;
  deleteChat(chatId: string): Promise<void>;
}
