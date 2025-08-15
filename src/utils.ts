import { AGENT_NAME } from './constants';

export function createMessage(message: string, from: string, game: string) {
  return {
    message,
    from,
    username: from === AGENT_NAME ? AGENT_NAME : '',
    game,
    createdAt: new Date().toISOString(),
  };
}
