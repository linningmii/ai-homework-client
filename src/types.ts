export interface IMessage {
  content: string;
  imageUrl?: string;
  source: "user" | "bot";
}
