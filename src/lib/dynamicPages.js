// 动态页面数据获取工具

// 二级单页数据（具体内容页面）
const mockApiData = {
  "data": [
    {
      "id": 5,
      "documentId": "vnzwz66q3tl1rxzmchujff00",
      "title": "测试1",
      "details": "\u003Cp\u003E\u003Cimg src=\"http://182.92.233.160:1137/uploads/logo_609d3754cc.png\" alt=\"logo.png\" width=\"496\" height=\"200\"\u003E\u003C/p\u003E",
      "createdAt": "2025-08-18T07:00:42.208Z",
      "updatedAt": "2025-08-18T08:30:57.504Z",
      "publishedAt": "2025-08-18T08:30:58.008Z",
      "locale": "en",
      "custom_category": {
        "id": 5,
        "documentId": "h9r88gviyj7fgh2qhfy0lxg6",
        "title": "自定义分类一",
        "describe": null,
        "sort": null,
        "createdAt": "2025-08-18T08:24:23.405Z",
        "updatedAt": "2025-08-18T08:31:14.749Z",
        "publishedAt": "2025-08-18T08:31:14.993Z",
        "url_slug": {
          "id": 10,
          "url_slug": "/cc1"
        },
        "parent": null
      },
      "picture": {
        "id": 27,
        "alt": null,
        "media": null
      },
      "url_slug": {
        "id": 9,
        "url_slug": "/test"
      }
    },
    {
      "id": 9,
      "documentId": "cnj7gwt9e3ge0lmggbkltie3",
      "title": "学习新语·抗战｜中流砥柱 民族先锋",
      "details": "\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E这是一段壮怀激烈的烽火岁月\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E这是一场涅槃重生的伟大征程\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E14年浴血奋战\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E谱写了气壮山河的壮丽史诗\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan style=\"color:rgb(51,51,51);font-size:18px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center bjh-strong\" style=\"max-width:100%;overflow-y:auto;\"\u003E\u003Cstrong\u003E“学习新语”栏目推出抗战系列报道\u003C/strong\u003E\u003C/span\u003E\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan style=\"color:rgb(51,51,51);font-size:18px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center bjh-strong\" style=\"max-width:100%;overflow-y:auto;\"\u003E\u003Cstrong\u003E跟着总书记走进抗战纪念地\u003C/strong\u003E\u003C/span\u003E\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E重温撼人心魄的民族记忆\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E传承历久弥新的抗战精神\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E本期走进\u003C/span\u003E\u003Cspan style=\"color:rgb(51,51,51);font-size:18px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center bjh-strong\" style=\"max-width:100%;overflow-y:auto;\"\u003E\u003Cstrong\u003E百团大战纪念馆\u003C/strong\u003E\u003C/span\u003E\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E回望抗战岁月\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E传承不屈精神\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"_3hMwG _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(0, 0, 0);display:flex;font-family:arial;font-size:12px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;margin-top:22px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cdiv class=\"_1NCGf\" style=\"-webkit-box-align:center;-webkit-box-direction:normal;-webkit-box-orient:vertical;align-items:center;display:flex;flex-direction:column;width:699.812px;\"\u003E\u003Cimg class=\"image_resized _1g4Ex _1i_Oe\" style=\"border-radius:13px;border:1px solid rgba(0, 0, 0, 0.05);width:699.812px;\" src=\"http://182.92.233.160:1137/uploads/external_image_1755508115518_18cc5057e8.jpeg@f_auto\" width=\"800\"\u003E\u003C/div\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:28px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E统筹：黄庆华 周年钧\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E记者：李紫薇 詹彦\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E执行：胡碧霞\u003C/span\u003E\u003C/div\u003E\u003Cdiv class=\"dpu8C _2kCxD\" style=\"-webkit-text-stroke-width:0px;background-color:rgb(255, 255, 255);color:rgb(34, 34, 34);font-family:arial;font-size:19px;font-style:normal;font-variant-caps:normal;font-variant-ligatures:normal;font-weight:400;letter-spacing:normal;line-height:30px;margin-top:24px;max-width:100%;orphans:2;overflow-x:visible;text-align:justify;text-decoration-color:initial;text-decoration-style:initial;text-decoration-thickness:initial;text-indent:0px;text-transform:none;white-space:normal;widows:2;word-spacing:0px;\"\u003E\u003Cspan class=\"bjh-p bjh-text-align-center\" style=\"max-width:100%;overflow-y:auto;\"\u003E设计：殷哲伦\u003C/span\u003E\u003C/div\u003E",
      "createdAt": "2025-08-18T09:09:01.615Z",
      "updatedAt": "2025-08-18T09:27:34.079Z",
      "publishedAt": "2025-08-18T09:27:34.519Z",
      "locale": "en",
      "custom_category": {
        "id": 5,
        "documentId": "h9r88gviyj7fgh2qhfy0lxg6",
        "title": "自定义分类一",
        "describe": null,
        "sort": null,
        "createdAt": "2025-08-18T08:24:23.405Z",
        "updatedAt": "2025-08-18T08:31:14.749Z",
        "publishedAt": "2025-08-18T08:31:14.993Z",
        "url_slug": {
          "id": 10,
          "url_slug": "/cc1"
        },
        "parent": null
      },
      "picture": {
        "id": 30,
        "alt": null,
        "media": {
          "id": 82,
          "documentId": "ccjcqlt4pu7blgoug6m5z9dl",
          "name": "logo.png",
          "alternativeText": null,
          "caption": null,
          "width": 496,
          "height": 200,
          "formats": {
            "thumbnail": {
              "ext": ".png",
              "url": "/uploads/thumbnail_logo_609d3754cc.png",
              "hash": "thumbnail_logo_609d3754cc",
              "mime": "image/png",
              "name": "thumbnail_logo.png",
              "path": null,
              "size": 10.53,
              "width": 245,
              "height": 99,
              "sizeInBytes": 10530
            }
          },
          "hash": "logo_609d3754cc",
          "ext": ".png",
          "mime": "image/png",
          "size": 3.83,
          "url": "/uploads/logo_609d3754cc.png",
          "previewUrl": null,
          "provider": "local",
          "provider_metadata": null,
          "createdAt": "2025-08-16T09:00:19.959Z",
          "updatedAt": "2025-08-16T09:00:19.959Z",
          "publishedAt": "2025-08-16T09:00:19.960Z"
        }
      },
      "url_slug": {
        "id": 15,
        "url_slug": "/mzxf"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 2
    }
  }
}

// 一级列表页数据（分类页面）
const mockCategoryData = {
  "data": [
    {
      "id": 4,
      "documentId": "ez6ag0zy36mtne4g8gn0pwjc",
      "title": "自定义分类二",
      "describe": null,
      "sort": null,
      "createdAt": "2025-08-18T08:24:41.903Z",
      "updatedAt": "2025-08-18T08:24:41.903Z",
      "publishedAt": "2025-08-18T08:24:42.074Z",
      "url_slug": {
        "id": 8,
        "url_slug": "/cc2"
      },
      "parent": null
    },
    {
      "id": 5,
      "documentId": "h9r88gviyj7fgh2qhfy0lxg6",
      "title": "自定义分类一",
      "describe": null,
      "sort": null,
      "createdAt": "2025-08-18T08:24:23.405Z",
      "updatedAt": "2025-08-18T08:31:14.749Z",
      "publishedAt": "2025-08-18T08:31:14.993Z",
      "url_slug": {
        "id": 10,
        "url_slug": "/cc1"
      },
      "parent": null
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 2
    }
  }
};

/**
 * 获取动态页面数据（二级单页）
 * @param {string} apiUrl - 接口URL（可选，如果未提供则使用模拟数据）
 * @returns {Promise<Object>} 页面数据
 */
export async function getDynamicPagesData(apiUrl = null) {
  try {
    if (apiUrl) {
      // 使用真实接口
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } else {
      // 使用模拟数据
      return mockApiData;
    }
  } catch (error) {
    console.warn('获取动态页面数据失败，使用模拟数据:', error);
    return mockApiData;
  }
}

/**
 * 获取一级分类列表数据
 * @param {string} apiUrl - 接口URL（可选，如果未提供则使用模拟数据）
 * @returns {Promise<Object>} 分类数据
 */
export async function getCategoryListData(apiUrl = null) {
  try {
    if (apiUrl) {
      // 使用真实接口
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } else {
      // 使用模拟数据
      return mockCategoryData;
    }
  } catch (error) {
    console.warn('获取分类列表数据失败，使用模拟数据:', error);
    return mockCategoryData;
  }
}

/**
 * 根据URL slug查找页面数据
 * @param {string} urlSlug - URL slug
 * @param {Object} pagesData - 页面数据
 * @returns {Object|null} 页面数据或null
 */
export function findPageBySlug(urlSlug, pagesData) {
  if (!pagesData?.data) return null;
  
  return pagesData.data.find(item => 
    item.url_slug?.url_slug === urlSlug
  ) || null;
}

/**
 * 根据URL slug查找分类数据
 * @param {string} urlSlug - URL slug
 * @param {Object} categoryData - 分类数据
 * @returns {Object|null} 分类数据或null
 */
export function findCategoryBySlug(urlSlug, categoryData) {
  if (!categoryData?.data) return null;
  
  return categoryData.data.find(item => 
    item.url_slug?.url_slug === urlSlug
  ) || null;
}

/**
 * 生成所有动态路径（二级单页）
 * @param {Array} languages - 支持的语言列表
 * @param {Object} pagesData - 页面数据
 * @returns {Array} 动态路径数组
 */
export function generateDynamicPaths(languages, pagesData) {
  const dynamicPaths = [];
  
  languages.forEach(({ code: lang }) => {
    pagesData.data.forEach((item) => {
      const urlSlug = item.url_slug?.url_slug;
      const parentSlug = item.custom_category?.url_slug?.url_slug;
      
      if (urlSlug && parentSlug) {
        // 构建嵌套路径：父级路径/当前路径
        const parentPath = parentSlug.replace(/^\//, '');
        const currentPath = urlSlug.replace(/^\//, '');
        const nestedSlug = `${parentPath}/${currentPath}`;
        
        dynamicPaths.push({
          params: { 
            lang,
            slug: nestedSlug
          },
          props: {
            pageData: item,
            lang,
            pageType: 'detail'
          }
        });
      } else if (urlSlug) {
        // 如果没有父级路径，使用原来的路径
        const slug = urlSlug.replace(/^\//, '');
        dynamicPaths.push({
          params: { 
            lang,
            slug
          },
          props: {
            pageData: item,
            lang,
            pageType: 'detail'
          }
        });
      }
    });
  });
  
  return dynamicPaths;
}

/**
 * 生成分类列表路径（一级列表页）
 * @param {Array} languages - 支持的语言列表
 * @param {Object} categoryData - 分类数据
 * @returns {Array} 动态路径数组
 */
export function generateCategoryPaths(languages, categoryData) {
  const categoryPaths = [];
  
  languages.forEach(({ code: lang }) => {
    categoryData.data.forEach((item) => {
      const urlSlug = item.url_slug?.url_slug;
      if (urlSlug) {
        // 移除开头的斜杠，保持为字符串
        const slug = urlSlug.replace(/^\//, '');
        categoryPaths.push({
          params: { 
            lang,
            slug
          },
          props: {
            categoryData: item,
            lang,
            pageType: 'category'
          }
        });
      }
    });
  });
  
  return categoryPaths;
}
