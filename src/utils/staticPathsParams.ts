import { getByCategory, getByCenterData } from '@apis/common';

export type ContentType = 'product' | 'news' | 'case' | 'about' | 'contact' | 'search';

export type ApiFn = (locale?: string, params?: any, from?: string) => Promise<any>;
export interface ApiConfig { api: ApiFn; params?: any; }

export enum ApiTypeEnum {
    CATEGORY = 'category',
    LIST = 'list',
    DETAIL = 'detail'
}

const requestMap: Partial<Record<ContentType, Partial<Record<ApiTypeEnum, ApiConfig>>>> = {
    // 产品
    product: {
        // 分类
        [ApiTypeEnum.CATEGORY]: {
            api: getByCategory,
            params: {
                fields: 'title,url_slug'
            }
        },
        // 列表
        [ApiTypeEnum.LIST]: {
            api: getByCenterData,
            params: {
                fields: 'title,url_slug',
                populate: {
                    product_category: {
                        fields: 'title,url_slug'
                    }
                },
                isLoadImg: true
            }
        },
        // 详情
        [ApiTypeEnum.DETAIL]: {
            api: getByCenterData,
            params: {
                fields: 'title,url_slug,details,product_advantage',
                isLoadImg: true
            }
        }
    },
    // 案例
    case: {
        // 分类
        [ApiTypeEnum.CATEGORY]: {
            api: getByCategory,
            params: {
                fields: 'title,url_slug'
            }
        },
        // 列表
        [ApiTypeEnum.LIST]: {
            api: getByCenterData,
            params: {
                fields: 'title,url_slug',
                populate: {
                    case_category: {
                        fields: 'title,url_slug'
                    }
                },
                isLoadImg: true
            }
        },
        // 详情
        [ApiTypeEnum.DETAIL]: {
            api: getByCenterData,
            params: {
                fields: 'title,url_slug,details,publishedAt',
                populate: {
                    case_category: {
                        fields: 'title,url_slug'
                    }
                },
                isLoadImg: true
            }
        }
    },
    // 新闻
    news: {
        // 分类
        [ApiTypeEnum.CATEGORY]: {
            api: getByCategory,
            params: {
                fields: 'title,url_slug'
            }
        },
        // 列表
        [ApiTypeEnum.LIST]: {
            api: getByCenterData,
            params: {
                fields: 'title,url_slug',
                isLoadImg: true
            }
        },
        // 详情
        [ApiTypeEnum.DETAIL]: {
            api: getByCenterData,
            params: {
                fields: 'title,url_slug,news_detail,publishedAt',
                isLoadImg: true
            }
        }
    },
    // 关于
    about: {
        // 分类
        [ApiTypeEnum.DETAIL]: {
            api: getByCenterData,
            params: {
                fields: 'title,url_slug,details',
            }
        }
    }
}


export default requestMap