import { Component, inject } from '@angular/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faArrowRight,faArrowLeft,faEuroSign, faArrowUpFromBracket, faX, faCheck, faCircle, faSquare} from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from "@angular/router";
import { Category } from '../../core/models/entity/category';
import { CategoryDataService } from '../../core/services/data/category.data.service';

@Component({
    selector: 'app-add-tool-page',
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './add-tool-page.html',
    styleUrl: './add-tool-page.scss',
})
export class AddToolPage {
    faArrowRight = faArrowRight;
    faArrowLeft = faArrowLeft;
    faEuroSign = faEuroSign;
    faArrowUpFromBracket = faArrowUpFromBracket;
    faX = faX;
    faCheck = faCheck;
    faCircle = faCircle;
    faSquare = faSquare;

    step: number = 1;
    selectedCategoryId?: number;

    public categoryDataService = inject(CategoryDataService);

    previousStep() {
        if (this.step > 1) {
            this.step--;
        }
    }

    nextStep() {
        if (this.step < 4) {
            this.step++;
        }
    }

    isCategorySelected(categoryId: number): boolean {
        return this.selectedCategoryId === categoryId;
    }

    selectCategory(categoryId: number): void {
        if (this.isCategorySelected(categoryId)) {
            this.selectedCategoryId = undefined;
        } else {
            this.selectedCategoryId = categoryId;
        }
    }

    getCategoryContainerClass(categoryId: number): string {
        const baseClass = 'flex flex-row justify-between items-center border-2 rounded-2xl cursor-pointer transition-all duration-400';
        const selectedClass = 'border-lime-500 bg-green-50 hover:bg-green-100';
        const unselectedClass = 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100';
        return this.isCategorySelected(categoryId) ? `${baseClass} ${selectedClass}` : `${baseClass} ${unselectedClass}`;
    }

    goToNextStep(): void {
        if (this.step === 1) {
            if (!this.validateStep1()) {
                return;
            }
        }
        this.nextStep();
    }

    private validateStep1(): boolean {
        return true;
    }

}
