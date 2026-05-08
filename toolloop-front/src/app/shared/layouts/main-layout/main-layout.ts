import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserHeader } from '../../components/user-header/user-header';
import { RouterOutlet } from '@angular/router';
import { AppWebsocketService } from '../../../core/services/websocket/app.websocket.service';

@Component({
    selector: 'main-layout',
    imports: [UserHeader, RouterOutlet],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit, OnDestroy {
    private wsService = inject(AppWebsocketService);

    ngOnInit(): void { this.wsService.connect(); }
    ngOnDestroy(): void { this.wsService.disconnect(); }
}
