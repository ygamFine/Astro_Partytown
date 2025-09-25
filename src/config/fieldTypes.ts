// 字段类型判断 - 基于数据返回的 key

/**
 * 根据字段名获取验证类型
 */
export function getFieldValidationType(fieldName: string, inputType?: string, backendValidateType?: string): string {
  // 仅依赖后端声明与输入类型，不做任何基于名称的猜测
  const type = (inputType || "").toLowerCase();
  const backend = (backendValidateType || "").toLowerCase();

  // 后端优先
  if (backend) return backend;

  // 输入类型映射
  if (type === "email") return "email";
  if (type === "tel" || type === "phone") return "phone";
  if (type === "url") return "url";
  if (type === "number") return "number";

  return "";
}

/**
 * 根据验证类型获取输入模式
 */
export function getInputMode(validateType?: string): string {
  if (!validateType) return "";
  
  switch (validateType) {
    case "email":
      return "email";
    case "phone":
    case "whatsapp":
      return "tel";
    case "number":
      return "numeric";
    case "url":
      return "url";
    default:
      return "";
  }
}
