// 统一复用轻客户端的 HTTP 能力，避免重复请求代码
import { PUBLIC_API_URL, STRAPI_TOKEN, fetchJson } from './apiClient.js';
import { extractUrl, getFirstImage } from '@utils/tools';

// 验证环境变量
if (!PUBLIC_API_URL || !STRAPI_TOKEN) {
    throw new Error('缺少必要的 Strapi 环境变量配置');
}
/**
 * 获取模版管理信息
 */
export async function getTemplatesContent(locale = 'en', slugOrId?: string | number) {
    try {

        const json = await fetchJson(`${PUBLIC_API_URL}/api/templates?locale=${locale}&populate=all`);
        if (!json.data) {
            return null;
        }
        const templatesData = (json.data && Array.isArray(json.data))
            ? json.data.map((item: any) => ({
                image: getFirstImage(extractUrl(item.template_image, true) || []),
                link: item.template_link,
                title: item.title,
                enable: item.template_enable,
            }))
            : [];

        return templatesData;


    } catch (error) {
        console.error('获取模版数据失败:', error);
        return null;
    }
}

/**
 * 获取 tpl3 模板的内容数据
 * @param locale 语言代码
 */
export async function getTpl1Content(locale = 'en') {
    try {
        // 导入静态数据
        const staticData = await import('@components/templates/Index/tpl1/staticData/templates.json');
        
        console.log('使用 tpl1 静态数据');
        return staticData.default || staticData;
    } catch (error) {
        console.error('获取 tpl1 数据失败:', error);
        // 如果静态数据加载失败，尝试从 API 获取
        try {
            const json = await fetchJson(`${PUBLIC_API_URL}/api/homepage?locale=${locale}&populate=deep`);
            return json.data;
        } catch (apiError) {
            console.error('API 获取 tpl1 数据也失败:', apiError);
            return null;
        }
    }
}

/**
 * 获取 tpl3 模板的内容数据
 * @param locale 语言代码
 */
export async function getTpl3Content(locale = 'en') {
    try {
        // 导入静态数据
        const staticData = await import('@components/templates/Index/tpl3/staticData/templates.json');
        
        console.log('使用 tpl3 静态数据');
        return staticData.default || staticData;
    } catch (error) {
        console.error('获取 tpl3 数据失败:', error);
        // 如果静态数据加载失败，尝试从 API 获取
        try {
            const json = await fetchJson(`${PUBLIC_API_URL}/api/homepage?locale=${locale}&populate=deep`);
            return json.data;
        } catch (apiError) {
            console.error('API 获取 tpl3 数据也失败:', apiError);
            return null;
        }
    }
}
