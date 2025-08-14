declare module '@pagefind/default-ui' {
  export interface PagefindUIOptions {
    element?: HTMLElement;
    showImages?: boolean;
    translations?: Record<string, string>;
    processResult?: (result: any) => any;
  }

  export class PagefindUI {
    constructor(options: PagefindUIOptions);
    triggerSearch(query: string): void;
  }
}
