import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faArrowLeft, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FullLogo } from '../../shared/components/full-logo/full-logo';

@Component({
    selector: 'app-login-page',
    imports: [FontAwesomeModule, FullLogo, RouterLink],
    templateUrl: './login-page.html',
    styleUrl: './login-page.scss',
})
export class LoginPage {
    public faCheckCircle = faCheckCircle;
    public faArrowLeft = faArrowLeft;
    public faUpload = faUpload;
}
