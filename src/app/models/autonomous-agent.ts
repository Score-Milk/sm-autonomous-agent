import { Agent, WindowBufferMemory } from 'alith';
import { personaManager } from './persona-manager';
import { env } from '../config/env';

interface AutonomousAgentOptions {
  model?: string;
  customContext?: string;
}

export class AutonomousAgent {
  public static readonly DEFAULT_AGENT_MODEL = 'gpt-4o';

  public agent: Agent;

  constructor(options: AutonomousAgentOptions = {}) {
    this.agent = this.createAgent(options);
  }

  private createAgent(_options: AutonomousAgentOptions): Agent {
    const options: AutonomousAgentOptions = {
      model: AutonomousAgent.DEFAULT_AGENT_MODEL,
      customContext: '',
      ..._options,
    };

    const persona = personaManager.personaTemplate.replace(
      '${AGENT_NAME}',
      env.AUTONOMOUS_AGENT_NAME,
    );

    return new Agent({
      model: options.model,
      preamble: `${persona} ${options.customContext || ''}`,
      memory: new WindowBufferMemory(),
    });
  }
}
