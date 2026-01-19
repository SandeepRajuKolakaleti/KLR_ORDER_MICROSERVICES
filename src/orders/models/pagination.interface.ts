export interface Pagination { 
    offset: number;
    limit: number;
}

export interface PaginatedResult<T> {
    total: number;
    offset: number;
    limit: number;
    data: T[];
}