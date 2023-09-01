import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Label } from 'src/models/label.entity';
import { Response } from 'src/utils/response.utils';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LabelsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('handleLabels')
  handleLabels(@MessageBody() data: { eventType: string; data }) {
    const { eventType, data: eventData } = data;

    this.server.emit(eventType, eventData);
  }
}
