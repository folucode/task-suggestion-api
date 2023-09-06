import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TasksGateway {
  @WebSocketServer() server;

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
