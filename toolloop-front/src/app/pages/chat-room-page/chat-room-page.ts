import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, ViewChild, ElementRef, DestroyRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ChatApiService } from '../../core/services/api/chat.api.service';
import { AppWebsocketService, WS_EVENTS } from '../../core/services/websocket/app.websocket.service';
import { ChatViewDTO } from '../../core/models/dto/chat-view-dto';
import { ChatMessageDTO } from '../../core/models/dto/chat-message-dto';

@Component({
    selector: 'app-chat-room-page',
    imports: [FontAwesomeModule, RouterLink],
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
    private wsService = inject(AppWebsocketService);
    private destroyRef = inject(DestroyRef);

    @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

    chatView = signal<ChatViewDTO | null>(null);
    newMessage = signal('');
    roomId!: number;

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
        this.roomId = Number(this.route.snapshot.paramMap.get('roomId'));
        this.wsService.connect();

        this.wsService.listenByType<ChatMessageDTO>(WS_EVENTS.CHAT)
            .pipe(
                filter(msg => msg.roomId === this.roomId),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe(msg => {
                this.chatView.update(view => view ? { ...view, messages: [...view.messages, msg] } : view);
                this.scrollToBottom();
            });

        const httpResponse = await this.chatApiService.getMessagesByChatRoomId(this.roomId);
        if (httpResponse instanceof HttpErrorResponse) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error al cargar el chat',
                detail: httpResponse.error?.message,
            });
            return;
        }
        this.chatView.set(httpResponse.body?.data ?? null);
        this.scrollToBottom();
    }

    async sendMessage(): Promise<void> {
        const text = this.newMessage().trim();
        if (!text) return;
        this.newMessage.set('');

        const httpResponse = await this.chatApiService.sendMessage(this.roomId, text);
        if (httpResponse instanceof HttpErrorResponse) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error al enviar el mensaje',
                detail: httpResponse.error?.message,
            });
            return;
        }
        const sent = httpResponse.body?.data;
        if (sent) {
            this.chatView.update(view => view ? { ...view, messages: [...view.messages, sent] } : view);
            this.scrollToBottom();
        }
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.messagesContainer) {
                this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
            }
        }, 0);
    }

    formatTime(createdAt: string): string {
        return new Date(createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
}
