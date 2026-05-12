import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ChatApiService } from '../../core/services/api/chat.api.service';
import { ChatViewDTO } from '../../core/models/dto/chat-view-dto';
import { ChatMessageDTO } from '../../core/models/dto/chat-message-dto';

@Component({
    selector: 'app-chat-room-page',
    imports: [FontAwesomeModule],
    providers: [MessageService],
    templateUrl: './chat-room-page.html',
    styleUrl: './chat-room-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatRoomPage implements OnInit {
    faArrowRight = faArrowRight;
    faPaperPlane = faPaperPlane;

    private route = inject(ActivatedRoute);
    private chatApiService = inject(ChatApiService);
    private messageService = inject(MessageService);

    chatView = signal<ChatViewDTO | null>(null);

    groupedMessages = computed(() => {
        const messages = this.chatView()?.messages ?? [];
        const groups: { date: string; messages: ChatMessageDTO[] }[] = [];
        let currentDate = '';
        for (const msg of messages) {
            const date = new Date(msg.createdAt).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            if (date !== currentDate) {
                currentDate = date;
                groups.push({ date, messages: [msg] });
            } else {
                groups[groups.length - 1].messages.push(msg);
            }
        }
        return groups;
    });

    async ngOnInit(): Promise<void> {
        const roomId = Number(this.route.snapshot.paramMap.get('roomId'));
        const httpResponse = await this.chatApiService.getMessagesByChatRoomId(roomId);
        if (httpResponse instanceof HttpErrorResponse) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error al cargar el chat',
                detail: httpResponse.error?.message,
            });
            return;
        }
        this.chatView.set(httpResponse.body?.data ?? null);
    }

    formatTime(createdAt: string): string {
        return new Date(createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
}
