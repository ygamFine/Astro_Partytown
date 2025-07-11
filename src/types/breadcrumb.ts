/**
 * 面包屑相关的类型定义
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
  lang?: string;
} 