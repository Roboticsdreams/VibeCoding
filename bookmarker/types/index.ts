import { Bookmark, Category, Tag, User } from "@prisma/client";

export type BookmarkWithRelations = Bookmark & {
  category: Category | null;
  tags: { tag: Tag }[];
};

export type CategoryWithCount = Category & {
  _count: {
    bookmarks: number;
  };
};

export type TagWithCount = Tag & {
  _count: {
    bookmarks: number;
  };
};

export type ViewMode = "table" | "cards" | "tree";

export type SortField = "createdAt" | "updatedAt" | "title" | "url";
export type SortOrder = "asc" | "desc";

export interface BookmarkFilters {
  search?: string;
  categoryId?: string;
  tagIds?: string[];
  isFavorite?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  domain?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
