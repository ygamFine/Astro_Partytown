import { PAGE_SIZE } from '@config/constant';
import { SUPPORTED_LANGUAGES } from './i18n-routes';
import requestMap, { type ContentType, ApiTypeEnum } from './staticPathsParams';
import { uniqueByParamsLangAndPage, joinUrlPaths } from './tools';

export interface Category {
  path: string;
  name: string;
}

export interface Pages {
  currentPage?: number;
  totalPages?: number;
  items?: any[];
  item?: any;
}

export interface PageProps {
  lang: string;
  category?: Category;
  pages?: Pages;
}

export interface StaticPath {
  params: {
    [x: string]: string;
    lang: string;
    page?: string;
    slug?: string;
  };
  props: PageProps;
}



// Worker function result type used by runForAllLanguages
type RunnerResult<T> = T[] | T | undefined | null;



export default class StaticPaths {
  private paths: StaticPath[];
  private perPage: number;
  constructor(perPage?: number) {
    this.paths = [];
    this.perPage = perPage ?? PAGE_SIZE;
  }
  // 产品分类静态路径
  async generateProductStaticPaths(): Promise<StaticPath[]> {
    return await this.generateStaticPaths('product');
  }
  // 新闻分类静态路径
  async generateNewsStaticPaths(): Promise<StaticPath[]> {
    return await this.generateStaticPaths('news');
  }
  // 案例分类静态路径
  async generateCaseStaticPaths(): Promise<StaticPath[]> {
    return await this.generateStaticPaths('case');
  }
  // 关于分类静态路径
  async generateAboutStaticPaths(): Promise<StaticPath[]> {
    return await this.detailStaticPaths('about', 'about');
  }
  // 生成静态路径
  async generateStaticPaths(contentType: ContentType = 'product'): Promise<StaticPath[]> {
    return await this.byStaticPaths(contentType);
  }
  async byStaticPaths(contentType: ContentType): Promise<StaticPath[]> {
    // 并行处理所有语言，提高性能
    await this.runForAllLanguages(async (lang: string) => {
      try {
        const allData = await this.apiTransfer(lang, contentType, ApiTypeEnum.LIST);
        // 拿取到数据后，进行分页处理
        const { totalPages } = this.getPaginationInfo(allData, 1, this.perPage);
        for (let page = 1; page <= totalPages; page++) {
          const { currentPageItems } = this.getPaginationInfo(allData, page, this.perPage);
          this.paths.push({
            params: { lang, page: page === 1 ? undefined : page.toString() },
            props: { lang, pages: { currentPage: page, totalPages, items: currentPageItems } }
          })
        }
        // 获取分类数据
        const categoriesData = await this.apiTransfer(lang, contentType, ApiTypeEnum.CATEGORY);
        // 遍历分类数据，生成分类路径
        categoriesData.forEach(async (category: any) => {
          this.paths.push({
            params: { lang, page: category.url_slug },
            props: { lang, category: { path: category.url_slug, name: category.title } }
          })
          const currentLoopData: any[] = [];
          // 根据分类路径，遍历所有的数据
          allData.forEach((item: any) => {
            if ((item.product_category?.url_slug || item.case_category?.url_slug || item.news_category?.url_slug) === category.url_slug) {
              currentLoopData.push(item);
            }
          })

          // 拿取到数据后，进行分页处理
          const { totalPages } = this.getPaginationInfo(currentLoopData, 1, this.perPage);
          for (let page = 1; page <= totalPages; page++) {
            const { currentPageItems } = this.getPaginationInfo(currentLoopData, page, this.perPage);
            this.paths.push({
              params: { lang, page: page === 1 ? category.url_slug : joinUrlPaths([category.url_slug, page.toString()]) },
              props: { lang, category: { path: category.url_slug, name: category.title }, pages: { currentPage: page, totalPages, items: currentPageItems } }
            })
          }
        })
        const uniquePaths = uniqueByParamsLangAndPage(this.paths);
        console.log(`------------------原始路径数量${this.paths.length}-------------- ---------------- 去重后路径数量${uniquePaths.length}--------------`)
        return uniquePaths;
      } catch (error) {
        console.error(`处理语言 ${lang} 失败:`, error);
        return [];
      }
    })
    return this.paths;
  }
  /**
 * 详情页的静态路径
 */
  async detailStaticPaths(contentType: ContentType, slug: string = 'slug'): Promise<StaticPath[]> {
    await this.runForAllLanguages(async (lang: string) => {
      try {
        const allData = await this.apiTransfer(lang, contentType, ApiTypeEnum.DETAIL);
        allData.forEach((item: any) => {
          const category = item.product_category || item.case_category || item.news_category
          this.paths.push({
            params: { lang, [slug]:  item.url_slug },
            props: { lang, category: { path: category?.url_slug, name: category?.title }, pages: { items: allData, item } }
          })
        })
        return uniqueByParamsLangAndPage(this.paths);
      } catch (error) {
        console.error(`处理语言 ${lang} 失败:`, error);
        return [];
      }
    })
    return this.paths;
  }
  

  /**
   * Api 接口中转
   */
  async apiTransfer(lang: string, contentType: ContentType, apiType: ApiTypeEnum): Promise<StaticPath[]> {

    const { api, params: requestParams } = requestMap[contentType]?.[apiType] || {};
    if (!api) {
      return [];
    }
    const data = await api(lang, contentType, requestParams);
    return data;
  }
  /**
   * 并行处理所有语言，提高性能
   * @param worker 执行函数
   * @returns 执行结果
   */
  private async runForAllLanguages<T>(
    worker: (lang: string) => Promise<RunnerResult<T>>
  ): Promise<T[]> {
    const tasks = SUPPORTED_LANGUAGES.map(async (lang) => {
      try {
        const res = await worker(lang);
        if (Array.isArray(res)) return res;
        if (res === undefined || res === null) return [];
        return [res];
      } catch (e) {
        console.error(`处理语言 ${lang} 失败:`, e);
        return [];
      }
    });
    const results = await Promise.all(tasks);
    return results.flat();
  }
  /**
    * 获取分页信息
    * @param items 数据数组
    * @param page 页码（从1开始）
    * @param perPage 每页数量
    * @returns 分页信息对象 { startIndex, endIndex, currentPageItems, totalPages }
    */
  private getPaginationInfo<T>(items: T[], page: number, perPage: number): {
    startIndex: number;
    endIndex: number;
    currentPageItems: T[];
    totalPages: number;
  } {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const currentPageItems = items.slice(startIndex, endIndex);
    const totalPages = Math.ceil(items.length / perPage);

    return { startIndex, endIndex, currentPageItems, totalPages };
  }
}