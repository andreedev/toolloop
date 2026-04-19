import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ProgressSpinner, ProgressSpinnerModule} from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';
import {GeneralDataService} from './core/services/data/general.data.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ProgressSpinner, BlockUIModule],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {
    public generalDataService = inject(GeneralDataService)
}
