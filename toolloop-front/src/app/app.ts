import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthApiService } from './core/services/api/auth.api.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, DatePipe],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    protected readonly title = signal('toolloop-front');
    public currentDate: Date = new Date();
    private authApiService = inject(AuthApiService);
}
