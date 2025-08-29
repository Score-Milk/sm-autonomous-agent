import { Agent, WindowBufferMemory } from 'alith';
import type { PersonasRepository } from '../../infra/database/repositories/personas';

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
    private readonly personasRepository: PersonasRepository,
    options: AutonomousAgentOptions = {}
  ) {
    this.agent = this.createDefaultAgent(options);
    this.initializeAgentAsync(options);
  }

  private createDefaultAgent(options: AutonomousAgentOptions): Agent {
    return new Agent({
      model: options.model ?? AutonomousAgent.DEFAULT_AGENT_MODEL,
      preamble: 'Initializing...',
      memory: new WindowBufferMemory(),
    });
  }

  private async initializeAgentAsync(
    options: AutonomousAgentOptions
  ): Promise<void> {
    const optionsWithDefaults: Required<AutonomousAgentOptions> = {
      model: options.model ?? AutonomousAgent.DEFAULT_AGENT_MODEL,
      personaName: options.personaName ?? AutonomousAgent.DEFAULT_PERSONA_NAME,
      platformName:
        options.platformName ?? AutonomousAgent.DEFAULT_PLATFORM_NAME,
      customContext: '',
    };

    try {
      const personas = await this.personasRepository.getPersonas();
      const platforms = await this.personasRepository.getPlatforms();

      const firstPersonaTemplate = personas[0];
      const persona =
        (await this.personasRepository.getPersonaByName(
          optionsWithDefaults.personaName
        )) ?? firstPersonaTemplate;

      const firstPlatform = platforms[0];
      let platform = firstPlatform;

      if (optionsWithDefaults.platformName) {
        for (const p of platforms) {
          if (p.name === optionsWithDefaults.platformName) {
            platform = p;
            break;
          }
        }
      }

      this.agent = new Agent({
        model: optionsWithDefaults.model,
        preamble: `
          ${persona?.template || ''}
          ${platform ? platform.template : ''}

          Always respond in character, as ${persona?.name || 'Agent'}.
          You may receive a message beginning with "[SYSTEM]:" at any time. This is a system message, treat it as such. It will provide context or command an action, behave accordingly.
          If you should not or don't want to reply to a message, respond with "[NOREPLY]".

          ${optionsWithDefaults.customContext || ''}
        `,
        memory: new WindowBufferMemory(),
      });
    } catch (error) {
      console.error('Failed to initialize agent with repository data:', error);
    }
  }
}
