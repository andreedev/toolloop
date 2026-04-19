import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faArrowLeft, faUpload } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-signup-page',
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './signup-page.html',
    styleUrl: './signup-page.scss',
})
export class SignupPage {
    public faCheckCircle = faCheckCircle;
    public faArrowLeft = faArrowLeft;
    public faUpload = faUpload;
}