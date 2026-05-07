import { inject, Injectable, signal } from '@angular/core';
import { Utils } from '../../helpers/utils';
import { AuthApiService } from '../api/auth.api.service';
import { filter, map, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppWebsocketService {
    private readonly authService = inject(AuthApiService);
    private readonly wsUrl = Utils.getWsEndpoint('toolloop');
    private socket: WebSocket | null = null;
    private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
    private pendingMessages: any[] = [];
    private manuallyClosed = false;
    private messageSubject = new Subject<any>();

    readonly lastIncomingMessage = signal<any | null>(null);

    connect(): void {
        if (typeof WebSocket === 'undefined') {
            console.warn('WebSocket is not supported in this environment');
            return;
        }

        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        const token = this.authService.getSessionToken();
        if (!token) {
            console.warn('WebSocket token is missing');
            return;
        }

        this.manuallyClosed = false;
        const socketUrl = `${this.wsUrl}?token=${encodeURIComponent(token)}`;
        this.socket = new WebSocket(socketUrl);

        this.socket.onopen = (event: Event) => {
            this.flushPendingMessages();
        };

        this.socket.onmessage = (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data);
                
                this.messageSubject.next(message); 
            
                this.lastIncomingMessage.set(message); 
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            this.socket = null;
            if (!this.manuallyClosed) {
                this.scheduleReconnect();
            }
        };
    }

    sendSomeData(message: Omit<any, 'messageType' | 'timestamp'>): void {
        this.sendMessage('someType', message);
    }

    sendPing(): void {
        const currentTimestamp = Date.now();
        this.sendMessage('ping', 'some data');
    }

    disconnect(): void {
        this.manuallyClosed = true;
        if (this.reconnectTimeoutId) {
            clearTimeout(this.reconnectTimeoutId);
            this.reconnectTimeoutId = null;
        }

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    public sendMessage(type: string, data: any): void {
        const payload = {
            type: type,
            data: data,
            timestamp: Date.now()
        };

        this.connect();

        if (this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(payload));
            return;
        }

        this.pendingMessages.push(payload);
        if (this.pendingMessages.length > 5) {
            this.pendingMessages.shift();
        }
    }

    private flushPendingMessages(): void {
        if (this.socket?.readyState !== WebSocket.OPEN || this.pendingMessages.length === 0) {
            return;
        }

        const messages = [...this.pendingMessages];
        this.pendingMessages = [];
        messages.forEach(message => this.socket?.send(JSON.stringify(message)));
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimeoutId) {
            return;
        }

        this.reconnectTimeoutId = setTimeout(() => {
            this.reconnectTimeoutId = null;
            this.connect();
        }, 3000);
    }

    listenByType<T>(type: string): Observable<T> {
        return this.messageSubject.pipe(
            filter(msg => msg.type === type),
            map(msg => msg.data as T)
        );
    }
}
