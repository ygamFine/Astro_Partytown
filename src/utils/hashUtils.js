/**
 * 通用哈希工具函数
 * 用于生成URL和文件名的哈希值
 */

/**
 * 生成URL哈希值
 * 将任意字符串转换为base64编码并移除特殊字符
 * @param {string} input - 输入字符串
 * @returns {string} 哈希值
 */
export function generateUrlHash(input) {
  if (!input) return '';
  return Buffer.from(input).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * 生成文件名哈希值
 * 专门用于处理文件名的哈希生成
 * @param {string} filename - 文件名或路径
 * @returns {string} 哈希值
 */
export function generateFilenameHash(filename) {
  if (!filename) return '';
  return generateUrlHash(filename);
}

/**
 * 生成图片URL哈希值
 * 专门用于处理图片URL的哈希生成
 * @param {string} imageUrl - 图片URL
 * @returns {string} 哈希值
 */
export function generateImageHash(imageUrl) {
  if (!imageUrl) return '';
  return generateUrlHash(imageUrl);
} 