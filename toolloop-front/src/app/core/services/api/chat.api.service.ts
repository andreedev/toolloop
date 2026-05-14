import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthApiService } from './auth.api.service';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { ChatRoomDTO } from '../../models/dto/chat-room-dto';
import { firstValueFrom, catchError, of } from 'rxjs';
import { Utils } from '../../helpers/utils';
import { ChatViewDTO } from '../../models/dto/chat-view-dto';
import { ChatMessageDTO } from '../../models/dto/chat-message-dto';

@Injectable({
    providedIn: 'root',
})
export class ChatApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getChats(): Promise<HttpResponse<HttpResponseBody<ChatRoomDTO[]>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint('chats');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.get<HttpResponseBody<ChatRoomDTO[]>>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getUnreadMessagesCount(): Promise<HttpResponse<HttpResponseBody<number>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint('chats/unread');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.get<HttpResponseBody<number>>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getMessagesByChatRoomId(roomId: number): Promise<HttpResponse<HttpResponseBody<ChatViewDTO>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`chats/${roomId}/messages`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.get<HttpResponseBody<ChatViewDTO>>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getOrCreateByRentalId(rentalId: number): Promise<HttpResponse<HttpResponseBody<ChatRoomDTO>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`chats/rental/${rentalId}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.post<HttpResponseBody<ChatRoomDTO>>(url, null, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async sendMessage(roomId: number, message: string): Promise<HttpResponse<HttpResponseBody<ChatMessageDTO>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`chats/${roomId}/messages`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.post<HttpResponseBody>(url, { message }, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async markMessagesAsRead(roomId: number): Promise<HttpResponse<HttpResponseBody> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`chats/${roomId}/read`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.post<HttpResponseBody>(url, null, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }
}