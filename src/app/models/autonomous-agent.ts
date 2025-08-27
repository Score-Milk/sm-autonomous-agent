import { Agent, WindowBufferMemory } from 'alith';
import type { PersonaManager } from './persona-manager';

interface AutonomousAgentOptions {
  personaName?: string;
  model?: string;
  customContext?: string;
}

export class AutonomousAgent {
  static readonly DEFAULT_AGENT_MODEL = 'gpt-4o';

  agent: Agent;

  constructor(
    private readonly personaManager: PersonaManager,
    options: AutonomousAgentOptions = {}
  ) {
    this.agent = this.createAgent(options);
  }

  private createAgent(options: AutonomousAgentOptions): Agent {
    const optionsWithDefaults: AutonomousAgentOptions = {
      model: AutonomousAgent.DEFAULT_AGENT_MODEL,
      customContext: '',
      ...options,
    };
    if (!optionsWithDefaults.personaName) {
      optionsWithDefaults.personaName = 'MilkMan';
    }

    const firstPersonaTemplate = Object.values(this.personaManager.personas)[0];
    const personaTemplate =
      this.personaManager.personas[optionsWithDefaults.personaName] ??
      firstPersonaTemplate;

    return new Agent({
      model: optionsWithDefaults.model,
      preamble: `
        ${personaTemplate}
        ${optionsWithDefaults.customContext || ''}
      `,
      memory: new WindowBufferMemory(),
    });
  }
}
