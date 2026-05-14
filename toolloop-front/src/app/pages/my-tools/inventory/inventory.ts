import {Component, inject, signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrashCan, faPlus, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import {ToolApiService} from '../../../core/services/api/tool.api.service';
import {Tool} from '../../../core/models/entity/tool';
import {CommonModule} from '@angular/common';
import { GeneralDataService } from '../../../core/services/data/general.data.service';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-inventory',
    imports: [FontAwesomeModule, RouterLink, CommonModule, TooltipModule, DialogModule],
    templateUrl: './inventory.html',
    styleUrl: './inventory.scss',
})
export class Inventory {
    faPencil = faPencil;
    faTrashCan = faTrashCan;
    faPlus = faPlus;
    faMagnifyingGlass = faMagnifyingGlass;
    faXmark = faXmark;

    private toolApiService = inject(ToolApiService);
    private generalDataService = inject(GeneralDataService);
    public userTools = signal<Tool[]>([]);

    showDeleteModal = signal(false);
    toolToDelete = signal<Tool | null>(null);

    constructor() {
        this.loadUserTools();
    }

    async loadUserTools(): Promise<void>{
        this.generalDataService.loading.set(true);
        const response = await this.toolApiService.getUserTools();
        this.userTools.set(response.body?.data || []);
        this.generalDataService.loading.set(false);
    }

    async deleteTool(): Promise<void> {
        if (!this.toolToDelete()) {
            return;
        }
        this.generalDataService.loading.set(true);
        const tool = this.toolToDelete();
        await this.toolApiService.deleteTool(tool!.toolId!);
        await this.loadUserTools();
        this.showDeleteModal.set(false);
    }
}
