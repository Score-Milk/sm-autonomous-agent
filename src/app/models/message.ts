export class Message {
  // biome-ignore lint/nursery/useMaxParams: all the parameters are needed for the message
  constructor(
    public message: string,
    public from: string,
    public username: string,
    public game: string,
    public createdAt: string = new Date().toISOString()
  ) {}
}

// TODO: Type the raw parameter properly
export class MessageMapper {
  // biome-ignore lint/suspicious/noExplicitAny: this will be typed later
  static toDomain(raw: any): Message {
    return new Message(
      raw.message,
      raw.from,
      raw.username,
      raw.game,
      raw.createdAt
    );
  }

  // biome-ignore lint/suspicious/noExplicitAny: this will be typed later
  static toResponse(message: Message): any {
    return {
      message: message.message,
      from: message.from,
      username: message.username,
      game: message.game,
      createdAt: message.createdAt,
    };
  }
}
