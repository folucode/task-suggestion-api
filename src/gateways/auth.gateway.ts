import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AuthGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('handleAuth')
  handleAuth(@MessageBody() body: { eventType: string; data }) {
    const { eventType, data } = body;

    this.server.emit(eventType, data);
  }
}
