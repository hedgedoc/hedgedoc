export interface Session {
  id: string;
  userId?: number;
  data: Record<string, any>;
}