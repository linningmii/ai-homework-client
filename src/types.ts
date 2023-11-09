export interface IMessage {
  content: string;
  imageUrl?: string;
  source: "user" | "midjourney-bot" | "openai-bot";
  options?: string[]
}
