import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpEventType, HttpHeaders, HttpResponse} from '@angular/common/http';
import {firstValueFrom, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {filter, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class S3ApiService {
    private http = inject(HttpClient);

    async putObject(url: string, file: File, isPublic: boolean=false): Promise<HttpResponse<unknown>> {
        return await firstValueFrom(
            this.http.put<unknown>(url, file, {
                observe: 'events',
                headers: new HttpHeaders({
                    'Content-Type': file.type || 'application/octet-stream',
                    'x-amz-acl': isPublic ? 'public-read' : 'private'
                })
            }).pipe(
                filter((event: HttpEvent<unknown>): event is HttpResponse<unknown> => event.type === HttpEventType.Response),
                catchError(error => throwError(() => error))
            )
        );
    }

}
