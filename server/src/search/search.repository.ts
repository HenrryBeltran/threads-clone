export type SearchResultRow = {
    id: string;
    username: string;
    name: string;
    profilePictureId: string | null;
    followStatus: number;
};

export type SearchHistoryRow = {
    id: string;
    userSearch: {
        id: string;
        username: string;
        name: string;
        profilePictureId: string | null;
    };
};

export abstract class SearchRepository {
    abstract searchUsers(userId: string, keywords: string): Promise<SearchResultRow[]>;
    abstract findHistory(userId: string): Promise<SearchHistoryRow[]>;
    abstract findDuplicate(ownerId: string, userSearch: string): Promise<{ id: string } | null>;
    abstract touchHistory(id: string): Promise<void>;
    abstract addHistory(ownerId: string, userSearch: string): Promise<void>;
    abstract clearHistory(userId: string): Promise<void>;
    abstract deleteRow(rowId: string): Promise<void>;
}
