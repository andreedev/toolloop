import { Component } from '@angular/core';
import { UserHeader } from '../../components/user-header/user-header';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'main-layout',
    imports: [UserHeader, RouterOutlet],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss',
})
export class MainLayout {}
