import { Agent, WindowBufferMemory } from 'alith';
import type { PersonaManager } from './persona-manager';

interface AutonomousAgentOptions {
  personaName?: string;
  model?: string;
  customContext?: string;
  platformName?: string;
}

export class AutonomousAgent {
  static readonly DEFAULT_AGENT_MODEL = 'gpt-4o';
  static readonly DEFAULT_PERSONA_NAME = 'Milk Man';
  static readonly DEFAULT_PLATFORM_NAME = 'Score Milk';

  agent: Agent;

  constructor(
    private readonly personaManager: PersonaManager,
    options: AutonomousAgentOptions = {}
  ) {
    this.agent = this.createAgent(options);
  }

  private createAgent(options: AutonomousAgentOptions): Agent {
    const optionsWithDefaults: Required<AutonomousAgentOptions> = {
      model: options.model ?? AutonomousAgent.DEFAULT_AGENT_MODEL,
      personaName: options.personaName ?? AutonomousAgent.DEFAULT_PERSONA_NAME,
      platformName:
        options.platformName ?? AutonomousAgent.DEFAULT_PLATFORM_NAME,
      customContext: '',
    };

    const firstPersonaTemplate = Object.values(this.personaManager.personas)[0];
    const persona =
      this.personaManager.personas[optionsWithDefaults.personaName] ??
      firstPersonaTemplate;

    const firstPlatform = Object.values(this.personaManager.platforms)[0];
    const platform =
      this.personaManager.platforms[optionsWithDefaults.platformName] ??
      firstPlatform;

    return new Agent({
      model: optionsWithDefaults.model,
      preamble: `
        ${persona.template}
        ${platform ? platform.template : ''}

        Always respond in character, as ${persona.name}.
        You may receive a message beginning with "[SYSTEM]:" at any time. This is a system message, treat it as such. It will provide context or command an action, behave accordingly.
        If you should not or don't want to reply to a message, respond with "[NOREPLY]".

        ${optionsWithDefaults.customContext || ''}
      `,
      memory: new WindowBufferMemory(),
    });
  }
}
