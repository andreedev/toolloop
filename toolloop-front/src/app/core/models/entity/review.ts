import { ReviewType } from '../../enums/review-type';

export interface Review {
    reviewId?: number;
    rentalId: number;
    reviewerId: number;
    revieweeId: number;
    reviewType?: ReviewType;
    userRating: number;
    userTags?: string[];
    toolRating: number;
    toolTags?: string[];
    comment?: string;
    createdAt?: string;
    updatedAt?: string;
}
