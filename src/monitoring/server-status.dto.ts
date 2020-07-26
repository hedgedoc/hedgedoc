export class ServerStatusDto {
  serverVersion: {
    major: number;
    minor: number;
    patch: number;
    preRelease?: string;
    commit?: string;
  };
  onlineNotes: number;
  onlineUsers: number;
  destictOnlineUsers: number;
  notesCount: number;
  registeredUsers: number;
  onlineRegisteredUsers: number;
  distictOnlineRegisteredUsers: number;
  isConnectionBusy: boolean;
  connectionSocketQueueLenght: number;
  isDisconnectBusy: boolean;
  disconnectSocketQueueLength: number;
}
