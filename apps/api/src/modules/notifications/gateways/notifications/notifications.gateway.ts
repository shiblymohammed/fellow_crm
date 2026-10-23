import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../../../common/guards/ws-jwt.guard';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Key is tenantId, value is Set of socket IDs
  private tenantRooms = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    const tenantId = client.handshake.query.tenantId as string;
    if (tenantId) {
      client.join(tenantId);
    }
  }

  handleDisconnect(client: Socket) {
    // cleanup automatically done by socket.io
  }

  // Method to be called by other services when an event happens
  sendNotification(tenantId: string, eventName: string, payload: any) {
    this.server.to(tenantId).emit(eventName, payload);
  }
}
