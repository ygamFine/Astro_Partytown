import { API_PAGE_SIZE } from '@config/constant';
export const fields = {
    list: 'title,url_slug',
    detail: '*',
    picture: 'name,url,width,height',
}

export const populate = {
    // 图片填充
    picture: {
        populate: {
            media: {
                fields: fields.picture
            }
        }
    }
}


const generateDefaultParams = (locale: string, isLoadImg: boolean = false) => {
    return {
        locale,
        fields: '*',
        ...(isLoadImg && {
          populate: {
            picture:populate.picture
          }
        }),
        pagination: {
          pageSize: API_PAGE_SIZE
        }
    }
}


export default generateDefaultParams;