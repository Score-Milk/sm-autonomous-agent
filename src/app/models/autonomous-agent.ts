import { Agent, WindowBufferMemory } from 'alith';
import { personaManager } from './persona-manager';

interface AutonomousAgentOptions {
  model?: string;
  customContext?: string;
}

export class AutonomousAgent {
  static readonly DEFAULT_AGENT_MODEL = 'gpt-4o';

  agent: Agent;

  constructor(options: AutonomousAgentOptions = {}) {
    this.agent = this.createAgent(options);
  }

  private createAgent(_options: AutonomousAgentOptions): Agent {
    const options: AutonomousAgentOptions = {
      model: AutonomousAgent.DEFAULT_AGENT_MODEL,
      customContext: '',
      ..._options,
    };

    return new Agent({
      model: options.model,
      preamble: `${personaManager.personaTemplate} ${
        options.customContext || ''
      }`,
      memory: new WindowBufferMemory(),
    });
  }
}
