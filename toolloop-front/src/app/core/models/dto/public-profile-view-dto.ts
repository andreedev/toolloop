import { Review } from "../entity/review";
import { OwnerToolDTO } from "./owner-tool-dto";

export interface PublicProfileViewDTO {
    userId: number;
    name: string;
    postalCode: string;
    profilePhotoKey: string | null;
    memberSince: string;
    averageRatingAsOwner: number;
    averageRatingAsRenter: number;
    totalReviewsAsOwner: number;
    totalReviewsAsRenter: number;
    availableTools: OwnerToolDTO[];
    reviews: Review[];
}