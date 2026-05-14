import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ChatApiService } from '../api/chat.api.service';
import { AppWebsocketService } from '../websocket/app.websocket.service';

@Injectable({
    providedIn: 'root',
})
export class ChatDataService {
    private readonly ws = inject(AppWebsocketService);
    private readonly chatApiService = inject(ChatApiService);

    public incomingChats$ = this.ws.listenByType<any>('CHAT'); 
    public unreadCount = signal(0);

    sendChatMessage(recipientId: number, text: string) {
        this.ws.sendMessage('chat', { recipientId, text });
    }

    async refreshUnreadCount() {
        const httpResponse = await this.chatApiService.getUnreadMessagesCount();
        if (httpResponse instanceof HttpErrorResponse) return;
        this.unreadCount.set(httpResponse.body?.data ?? 0);
    }
}
