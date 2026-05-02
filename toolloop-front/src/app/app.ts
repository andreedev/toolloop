import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { GeneralDataService } from './core/services/data/general.data.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ProgressSpinner, BlockUIModule, ToastModule],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    public generalDataService = inject(GeneralDataService)
}
