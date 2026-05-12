import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthApiService } from './auth.api.service';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { ChatRoomDTO } from '../../models/dto/chat-room-dto';
import { firstValueFrom, catchError, of } from 'rxjs';
import { Utils } from '../../helpers/utils';
import { FeaturedTool } from '../../models/dto/featured-tool';

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
    
}
