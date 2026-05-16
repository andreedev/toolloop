import { Component, inject, OnInit, signal, ChangeDetectionStrategy, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatApiService } from '../../core/services/api/chat.api.service';
import { AppWebsocketService, WS_EVENTS } from '../../core/services/websocket/app.websocket.service';
import { ChatRoomDTO } from '../../core/models/dto/chat-room-dto';
import { ChatMessageDTO } from '../../core/models/dto/chat-message-dto';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-chats-page',
    imports: [RouterLink, CommonModule],
    templateUrl: './chats-page.html',
    styleUrl: './chats-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPage implements OnInit {
    private messageService = inject(MessageService);
    private chatApiService = inject(ChatApiService);
    private wsService = inject(AppWebsocketService);
    private destroyRef = inject(DestroyRef);

    chats = signal<ChatRoomDTO[]>([]);

    async ngOnInit(): Promise<void> {
        this.wsService.connect();

        this.wsService.listenByType<ChatMessageDTO>(WS_EVENTS.CHAT)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(msg => {
                this.chats.update(list =>
                    list.map(chat =>
                        chat.roomId === msg.roomId
                            ? { ...chat, unreadCount: chat.unreadCount + 1, lastMessageDate: msg.createdAt }
                            : chat
                    )
                );
            });

        const httpResponse = await this.chatApiService.getChats();
        if (httpResponse instanceof HttpErrorResponse) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error al cargar los chats',
                detail: httpResponse.error?.message,
            });
            return;
        }
        this.chats.set(httpResponse.body?.data ?? []);
    }
}
