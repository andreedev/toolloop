import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

@Component({
    selector: 'app-star-rating',
    standalone: true,
    imports: [FontAwesomeModule],
    templateUrl: './star-rating.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRatingComponent {
    public value = input<number>(0);
    public valueChange = output<number>();

    public hovered = signal(0);

    public stars = [1, 2, 3, 4, 5];
    public faStarSolid = faStarSolid;
    public faStarRegular = faStarRegular;

    isActive(star: number): boolean {
        return star <= (this.hovered() || this.value());
    }

    onHover(star: number): void { this.hovered.set(star); }
    onLeave(): void { this.hovered.set(0); }
    onClick(star: number): void { this.valueChange.emit(star); }
}
