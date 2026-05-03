import { ReviewType } from '../../enums/review-type';
import { User } from './user';

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

    // transient: no persisten en la BD
    reviewer?: User;
    reviewee?: User;
}
