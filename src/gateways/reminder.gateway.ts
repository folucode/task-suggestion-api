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
export class ReminderGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('handleReminders')
  handleReminders(@MessageBody() body: { eventType: string; data }) {
    const { eventType, data } = body;

    this.server.emit(eventType, data);
  }
}
