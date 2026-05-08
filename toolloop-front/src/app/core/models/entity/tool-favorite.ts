import { Tool } from './tool';

export interface ToolFavorite {
    toolFavoriteId: number;
    userId: number;
    toolId: number;
    createdAt: string;
    updatedAt: string;
    tool?: Tool;
}