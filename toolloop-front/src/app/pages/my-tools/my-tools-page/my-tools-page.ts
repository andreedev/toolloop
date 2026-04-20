import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from "@angular/router";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faWrench, faArrowTrendUp, faPencil,faTrashCan, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-my-tools-page',
    imports: [RouterLink, FontAwesomeModule, RouterOutlet, RouterLinkActive],
    templateUrl: './my-tools-page.html',
    styleUrl: './my-tools-page.scss',
})
export class MyToolsPage {
    faWrench = faWrench;
    faArrowTrendUp = faArrowTrendUp;
    faPencil = faPencil;
    faTrashCan = faTrashCan;
    faPlus = faPlus;


}
