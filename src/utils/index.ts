const strapiStaticUrl = process.env.STRAPI_STATIC_URL || import.meta.env?.STRAPI_STATIC_URL;
export const imageProcess = (imageUrl: String) => {
    return strapiStaticUrl + imageUrl;
}