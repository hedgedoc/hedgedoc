export interface Session {
  id: string;
  userId?: string;
  data: Record<string, any>;
}