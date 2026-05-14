import {Component, inject, OnInit, signal} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrashCan, faPlus, faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import {ToolApiService} from '../../../core/services/api/tool.api.service';
import {Tool} from '../../../core/models/entity/tool';
import {CommonModule} from '@angular/common';
import { GeneralDataService } from '../../../core/services/data/general.data.service';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
@Component({
    selector: 'app-inventory',
    imports: [FontAwesomeModule, RouterLink, CommonModule, TooltipModule, DialogModule],
    templateUrl: './inventory.html',
    styleUrl: './inventory.scss',
})
export class Inventory implements OnInit {
    faPencil = faPencil;
    faTrashCan = faTrashCan;
    faPlus = faPlus;
    faMagnifyingGlass = faMagnifyingGlass;
    faXmark = faXmark;

    private messageService = inject(MessageService);
    private toolApiService = inject(ToolApiService);
    private generalDataService = inject(GeneralDataService);
    public userTools = signal<Tool[]>([]);

    showDeleteModal = signal(false);
    toolToDelete = signal<Tool | null>(null);

    ngOnInit() {
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
        const httpResponse = await this.toolApiService.deleteTool(tool!.toolId!);
        if (httpResponse instanceof HttpErrorResponse) {
            const message = httpResponse.error?.message || 'Error desconocido';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            this.generalDataService.loading.set(false);
            return;
        }
        const message = httpResponse.body?.message;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: message });
        await this.loadUserTools();
        this.showDeleteModal.set(false);
    }
}
