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

    async getToolById(toolId: number): Promise<HttpResponse<HttpResponseBody<Tool>>> {
        const url = Utils.getApiEndpoint(`tool/${toolId}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody>(url, { observe: 'response', headers }));
    }

    async addTool(tool: Tool): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint('tool');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody>(url, tool, { observe: 'response', headers }));
    }

    async updateTool(tool: Tool): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint(`tool/${tool.toolId}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.put<HttpResponseBody>(url, tool, { observe: 'response', headers }));
    }

    async deleteTool(toolId: number): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint(`tool/${toolId}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.delete<HttpResponseBody>(url, { observe: 'response', headers }));
    }

}
