export declare class VendeursQueryDto {
    categories?: string;
    zones?: string;
    level?: string;
    minRating?: number;
    sort?: 'rating_desc' | 'missions_desc' | 'name_asc';
    page?: number;
    limit?: number;
}
