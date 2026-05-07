import { inject, Injectable } from '@angular/core';
import { AppWebsocketService } from '../websocket/app.websocket.service';

@Injectable({
    providedIn: 'root',
})
export class ChatDataService {
    private readonly ws = inject(AppWebsocketService);

    public incomingChats$ = this.ws.listenByType<any>('CHAT'); 

    sendChatMessage(recipientId: number, text: string) {
        this.ws.sendMessage('chat', { recipientId, text });
    }
}
