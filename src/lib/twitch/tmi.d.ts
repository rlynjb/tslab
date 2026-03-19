declare module "tmi.js" {
  interface ClientOptions {
    connection?: {
      secure?: boolean;
      reconnect?: boolean;
    };
    channels?: string[];
  }

  interface Tags {
    id?: string;
    username?: string;
    "display-name"?: string;
    [key: string]: string | undefined;
  }

  export class Client {
    constructor(options: ClientOptions);
    on(
      event: "message",
      callback: (
        channel: string,
        tags: Tags,
        message: string,
        self: boolean
      ) => void
    ): void;
    on(event: "connected" | "disconnected", callback: () => void): void;
    connect(): Promise<[string, number]>;
    disconnect(): Promise<[string, number]>;
  }
}
