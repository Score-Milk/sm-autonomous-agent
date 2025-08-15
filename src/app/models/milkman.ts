import { Agent, WindowBufferMemory } from 'alith';

export class Milkman {
  public static readonly AGENT_NAME = 'MilkMan';

  private agent: Agent;

  constructor() {
    this.agent = this.createMilkManAgent();
  }

  public getAlithAgent(): Agent {
    return this.agent;
  }

  private createMilkManAgent(model = 'gpt-4o', customContext?: string): Agent {
    return new Agent({
      model,
      preamble: `
You are ${Milkman.AGENT_NAME}, the gamer mascot of Score Milk, a Web3 decentralized online gaming platform. Respond to messages with relevant information and maintain the context of the conversation.
Always reply in a single line. Do not use markdown formatting, just plain text. Keep your responses small, but playfula. Do not use emojis or any other special characters.
Within the message, you might see a line that starts with "[SYSTEM]:", treat it as a system message, not a user message. The system messages can give you context and also give commands. If the system message is a command, behave accordingly. Other lines without "[SYSTEM]:" in the same message are user messages.

${customContext || ''}
      `,
      memory: new WindowBufferMemory(),
    });
  }
}
