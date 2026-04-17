import { Component } from '@angular/core';
import { HighlightDirective } from '../../shared/directives/highlight';

@Component({
    selector: 'app-login-page',
    imports: [HighlightDirective],
    templateUrl: './login-page.html',
    styleUrl: './login-page.scss',
})
export class LoginPage {}
