import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { Utils } from '../../helpers/utils';
import {catchError, firstValueFrom, of} from 'rxjs';
import {AuthApiService} from './auth.api.service';
import {Tool} from '../../models/entity/tool';
import { AddToolRequest } from '../../models/dto/add-tool-request';
import { AddToolResponse } from '../../models/dto/add-tool-response';
import { MapToolsRequest } from '../../models/dto/map-tools-request';
import { ToolMapItem } from '../../models/dto/tool-map-item';
import { UpdateToolRequest } from '../../models/dto/update-tool-request';
import { ToolCalendarResponse } from '../../models/dto/tool-calendar-response';
import { Review } from '../../models/entity/review';

@Injectable({
    providedIn: 'root',
})
export class ToolApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getUserTools(): Promise<HttpResponse<HttpResponseBody<Tool[]>>> {
        const url = Utils.getApiEndpoint('tool/user-tools');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.get<HttpResponseBody>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getToolById(toolId: number): Promise<HttpResponse<HttpResponseBody<Tool>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`tool/${toolId}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async addTool(tool: AddToolRequest): Promise<HttpResponse<HttpResponseBody<AddToolResponse>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint('tool/add');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody<AddToolResponse>>(url, tool, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async updateTool(toolId: number, tool: UpdateToolRequest): Promise<HttpResponse<HttpResponseBody> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`tool/${toolId}/update`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.put<HttpResponseBody>(url, tool, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async deleteTool(toolId: number): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint(`tool/${toolId}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.delete<HttpResponseBody>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getAvailability(toolId: number, period: string): Promise<HttpResponse<HttpResponseBody<ToolCalendarResponse>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`tool/${toolId}/availability?period=${period}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody<ToolCalendarResponse>>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getToolsForMap(request: MapToolsRequest): Promise<HttpResponse<HttpResponseBody<ToolMapItem[]>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint('tool/map');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody<ToolMapItem[]>>(url, request, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getToolReviews(toolId: number): Promise<HttpResponse<HttpResponseBody<Review[]>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`tool/${toolId}/reviews`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody<Review[]>>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

}
