import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faArrowRight, faPaperPlane} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-chat-room-page',
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './chat-room-page.html',
    styleUrl: './chat-room-page.scss',
})
export class ChatRoomPage {
    faArrowRight = faArrowRight;
    faPaperPlane = faPaperPlane;
}
