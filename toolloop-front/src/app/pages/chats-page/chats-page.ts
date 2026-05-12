import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RentalApiService } from '../../core/services/api/rental.api.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { UtilService } from '../../core/services/util/util.service';
import { ViewportService } from '../../core/services/util/viewport.service';

@Component({
    selector: 'app-chats-page',
    imports: [RouterLink],
    templateUrl: './chats-page.html',
    styleUrl: './chats-page.scss',
})
export class ChatsPage implements OnInit {
    private router = inject(Router);
    private viewportService = inject(ViewportService);
    public utilService = inject(UtilService);
    private messageService = inject(MessageService);
    private rentalApiService = inject(RentalApiService);
    private generalDataService = inject(GeneralDataService);

    ngOnInit(): void {
        
    }
}
