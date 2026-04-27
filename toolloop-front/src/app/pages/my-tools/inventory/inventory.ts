import {Component, inject, signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faPencil,faTrashCan, faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import {ToolApiService} from '../../../core/services/api/tool.api.service';
import {Tool} from '../../../core/models/entity/tool';
import {CommonModule} from '@angular/common';
import { GeneralDataService } from '../../../core/services/data/general.data.service';

@Component({
    selector: 'app-inventory',
    imports: [FontAwesomeModule, RouterLink, CommonModule],
    templateUrl: './inventory.html',
    styleUrl: './inventory.scss',
})
export class Inventory {
    faPencil = faPencil;
    faTrashCan = faTrashCan;
    faPlus = faPlus;
    faMagnifyingGlass = faMagnifyingGlass;

    private toolApiService = inject(ToolApiService);
    private generalDataService = inject(GeneralDataService);
    public userTools = signal<Tool[]>([]);

    constructor() {
        this.loadUserTools();
    }

    async loadUserTools(): Promise<void>{
        this.generalDataService.loading.set(true);
        const response = await this.toolApiService.getUserTools();
        this.userTools.set(response.body?.data || []);
        this.generalDataService.loading.set(false);
    }
}
