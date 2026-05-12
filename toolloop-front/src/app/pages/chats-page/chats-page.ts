import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ChatApiService } from '../../core/services/api/chat.api.service';
import { ChatRoomDTO } from '../../core/models/dto/chat-room-dto';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-chats-page',
    imports: [RouterLink],
    providers: [MessageService],
    templateUrl: './chats-page.html',
    styleUrl: './chats-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatsPage implements OnInit {
    private messageService = inject(MessageService);
    private chatApiService = inject(ChatApiService);

    chats = signal<ChatRoomDTO[]>([]);

    async ngOnInit(): Promise<void> {
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
