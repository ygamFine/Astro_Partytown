// 搜索模块类型声明
declare module '/src/lib/searchIndex.js' {
  export interface SearchResult {
    id: number;
    type: 'product' | 'news' | 'case';
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    category: string;
    image: string;
    url: string;
    lang: string;
    searchText: string;
    score?: number;
    price?: string;
    date?: string;
    client?: string;
  }

  export interface SearchData {
    products: SearchResult[];
    news: SearchResult[];
    cases: SearchResult[];
  }

  export function generateSearchIndex(): Promise<SearchData>;
  export function performSearch(query: string, lang?: string, type?: string): Promise<SearchResult[]>;
  export function getSearchSuggestions(query: string, lang?: string): Promise<string[]>;
} 