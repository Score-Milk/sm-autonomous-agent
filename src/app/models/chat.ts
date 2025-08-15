import { Agent } from 'alith';

export class Chat {
  constructor(
    public id: string,
    public userId: string,
    public gameId: string,
    public agent: Agent
  ) {}
}
