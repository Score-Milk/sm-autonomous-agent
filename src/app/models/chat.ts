import { Agent } from 'alith';

export class Chat {
  constructor(
    public id: string,
    public userId: string,
    public gameName: string,
    public agent: Agent
  ) { }
}
