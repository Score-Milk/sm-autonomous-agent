import fs from 'fs';
import path from 'path';
import { Agent, WindowBufferMemory } from 'alith';

const personaPath = path.join(__dirname, 'persona.txt');
const personaTemplate = fs.readFileSync(personaPath, 'utf-8');

interface MilkmanOptions {
  model?: string;
  customContext?: string;
}

export class Milkman {
  public static readonly AGENT_NAME = 'MilkMan';
  public static readonly DEFAULT_AGENT_MODEL = 'gpt-4o';

  public agent: Agent;

  constructor(options: MilkmanOptions = {}) {
    this.agent = this.createMilkManAgent(options);
  }

  private createMilkManAgent(_options: MilkmanOptions): Agent {
    const options: MilkmanOptions = {
      model: Milkman.DEFAULT_AGENT_MODEL,
      customContext: '',
      ..._options,
    };

    const persona = personaTemplate.replace(
      '${AGENT_NAME}',
      Milkman.AGENT_NAME
    );

    return new Agent({
      model: options.model,
      preamble: `${persona} ${options.customContext || ''}`,
      memory: new WindowBufferMemory(),
    });
  }
}

