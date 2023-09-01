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
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('handleTask')
  handleTask(@MessageBody() data: { eventType: string; data }) {
    const { eventType, data: eventData } = data;

    this.server.emit(eventType, eventData);
  }

  @SubscribeMessage('handleSubtask')
  handleSubtask(@MessageBody() data: { eventType: string; data }) {
    const { eventType, data: eventData } = data;

    this.server.emit(eventType, eventData);
  }
}
