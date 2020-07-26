import { Injectable } from '@nestjs/common';
import { ServerStatusDto } from './server-status.dto';

@Injectable()
export class MonitoringService {
  getServerStatus(): ServerStatusDto {
    return {
      connectionSocketQueueLenght: 0,
      destictOnlineUsers: 0,
      disconnectSocketQueueLength: 0,
      distictOnlineRegisteredUsers: 0,
      isConnectionBusy: false,
      isDisconnectBusy: false,
      notesCount: 0,
      onlineNotes: 0,
      onlineRegisteredUsers: 0,
      onlineUsers: 0,
      registeredUsers: 0,
      serverVersion: {
        major: 2,
        minor: 0,
        patch: 0,
        preRelease: 'dev',
      },
    };
  }
}
