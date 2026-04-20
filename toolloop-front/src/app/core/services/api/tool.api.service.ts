import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { Utils } from '../../helpers/utils';
import {firstValueFrom} from 'rxjs';
import {AuthApiService} from './auth.api.service';
import {Tool} from '../../models/entity/tool';

@Injectable({
    providedIn: 'root',
})
export class ToolApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getUserTools(): Promise<HttpResponse<HttpResponseBody<Tool[]>>> {
        const url = Utils.getApiEndpoint('tool/user-tools');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody>(url, { observe: 'response', headers }));
    }

}
