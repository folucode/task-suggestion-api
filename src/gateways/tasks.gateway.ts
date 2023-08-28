import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Subtask } from 'src/models/subtask.entity';
import { Task } from 'src/models/task.entity';
import { Response } from 'src/utils/response.utils';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('handleTask')
  handleTask(
    @MessageBody() data: { eventType: string; data: Response<Task> },
    @ConnectedSocket() client: Socket,
  ) {
    const { eventType, data: eventData } = data;

    this.server.emit(eventType, eventData);
  }

  @SubscribeMessage('handleSubtask')
  handleSubtask(
    @MessageBody() data: { eventType: string; data: Response<Subtask> },
    @ConnectedSocket() client: Socket,
  ) {
    const { eventType, data: eventData } = data;

    this.server.emit(eventType, eventData);
  }
}
