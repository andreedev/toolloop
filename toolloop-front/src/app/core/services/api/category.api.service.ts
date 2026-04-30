import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { Utils } from '../../helpers/utils';
import { Tool } from '../../models/entity/tool';
import { Category } from '../../models/entity/category';
import { HttpClient, HttpResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class CategoryApiService {
    private httpClient: HttpClient = inject(HttpClient);

    async getCategories(): Promise<HttpResponse<HttpResponseBody<Category[]>>> {
        const url = Utils.getApiEndpoint('category');
        return firstValueFrom(this.httpClient.get<HttpResponseBody>(url, { observe: 'response' }));
    }
    
}
