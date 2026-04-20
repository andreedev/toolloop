import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faPencil,faTrashCan, faPlus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-inventory',
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './inventory.html',
    styleUrl: './inventory.scss',
})
export class Inventory {
    faPencil = faPencil;
    faTrashCan = faTrashCan;
    faPlus = faPlus;
    faMagnifyingGlass = faMagnifyingGlass;
    
}
