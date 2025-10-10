import React, { useState } from 'react';
console.log('加载 React Form 组件')
interface InquiryFormProps {
  lang: string;
  id?: string;
  transitions?: any;
  showTitle?: boolean;
  showDescription?: boolean;
  successMode?: "toast" | "modal";
  className?: string;
  companyId?: string;
  formId: string;
  formStructure: any[];
  formTrans: any[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface FormFieldValue {
  [key: string]: any;
}

const InquiryForm: React.FC<InquiryFormProps> = ({
  lang = 'en',
  id = "contact-page-form",
  transitions,
  showTitle = true,
  showDescription = true,
  successMode = "toast",
  className = '',
  companyId = '',
  formId = '',
  formStructure = [],
  formTrans = [],
  onSuccess,
  onError,
}) => {
  const [fieldValues, setFieldValues] = useState<FormFieldValue>({});
  const [errorMap, setErrorMap] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const t = transitions || {};
  console.log('源数据', formStructure)
  console.log('翻译数据', formTrans)
  // 辅助函数 - 与 Astro 版本保持一致
  const toSlug = (val: any) =>
    String(val ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const normalizeType = (raw: any, item?: any) => {
    const type = String(raw ?? "").toLowerCase();
    const hasOptions = (arr: any) => Array.isArray(arr) && arr.length > 0;
    const itemHasOptions =
      hasOptions(item?.options) ||
      hasOptions(item?.choices) ||
      hasOptions(item?.items) ||
      hasOptions(item?.list);

    if (type === "dropdown") return "select";
    if (type === "radiogroup" || type === "radio-group") return "radio";
    if (type === "checkboxgroup" || type === "checkbox-group") return "checkbox-group";
    if (type === "checkbox" && itemHasOptions) return "checkbox-group";
    if (type === "phone") return "tel";
    if (type === "number") return "number";
    if (type === "date") return "date";
    if (type === "datetime" || type === "datetime-local") return "datetime-local";
    if (["email", "url", "file", "textarea", "select", "radio", "checkbox", "tel", "text"].includes(type)) return type;
    if (itemHasOptions) return "select";
    return "text";
  };

  const getOptions = (item: any) => {
    const opts = item?.options ?? item?.choices ?? item?.items ?? item?.list ?? [];
    return Array.isArray(opts) ? opts : [];
  };

  const getFieldName = (item: any, index: number) => {
    return String(item?.name ?? item?.key ?? item?.code ?? item?.id ?? `field_${index}`);
  };

  const i18nFormText = (raw: any): string => {
    // 简化版本，可以根据需要扩展国际化逻辑
    return String(raw ?? "").trim();
  };

  // Cookie 操作函数 - 与 Astro 版本一致
  const getCookieValue = (name: string): string => {
    if (typeof document === "undefined" || !name) return "";
    const encodedName = encodeURIComponent(name) + "=";
    const parts = document.cookie ? document.cookie.split("; ") : [];
    const match = parts.find((row) => row.startsWith(encodedName));
    if (!match) return "";
    const value = match.substring(encodedName.length);
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  // 错误处理函数
  const setError = (key: string, message: string) => {
    setErrorMap(prev => new Map(prev.set(key, message)));
  };

  const clearError = (key: string) => {
    setErrorMap(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  };

  const getDefaultValidationMessage = (validateType: string) => {
    const messages = t?.form?.validation || {};
    switch (validateType) {
      case "email":
        return messages?.email_invalid;
      case "phone":
        return messages?.phone_invalid;
      case "whatsapp":
        return messages?.whatsapp_invalid;
      default:
        return messages?.invalid_format;
    }
  };

  // 表单验证 - 与 Astro 版本完全一致
  const validate = (): boolean => {
    let hasError = false;
    
    // 普通控件验证
    formStructure.forEach((item, index) => {
      const fieldName = getFieldName(item, index);
      const rawType = item?.type ?? item?.componentType ?? item?.inputType;
      const type = normalizeType(rawType, item);
      const preferredKeySource = item?.key ?? item?.code ?? item?.id ?? fieldName;
      const slugFromPreferred = toSlug(preferredKeySource);
      const slugFromName = toSlug(fieldName);
      const fieldKey = slugFromPreferred || slugFromName || `field_${index}`;
      console.log('fieldName', fieldName);
      console.log('slugFromName', slugFromName);
      const required = Boolean(
        item?.required ??
        item?.isRequired ??
        item?.require ??
        item?.must ??
        item?.requiredFlag,
      );
      
      const rawPlaceholder = item?.prompt ?? 
        (t.form?.placeholders ? t.form.placeholders[fieldName] : "") ?? "";
      const placeholder = i18nFormText(rawPlaceholder);
      const rawPrompt = formTrans[item?.placeholder]?.[lang] ?? item?.placeholder;
      const prompt = i18nFormText(rawPrompt);
      
      if (type === "radio" || type === "checkbox-group") {
        if (!required) {
          clearError(fieldKey);
          return;
        }
        
        const value = fieldValues[fieldKey];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          setError(fieldKey, prompt);
          hasError = true;
        } else {
          clearError(fieldKey);
        }
      } else if (type !== "checkbox") {
        const rawVal = fieldValues[fieldKey] || "";
        const value = typeof rawVal === "string" ? rawVal.trim() : "";
        
        if (required && !value) {
          setError(fieldKey, prompt);
          hasError = true;
          return;
        }
        
        // 类型验证
        let invalidByType = false;
        if (type === "email") {
          const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          invalidByType = !!value && !emailRe.test(value);
        } else if (type === "tel" || type === "phone") {
          const digits = value.replace(/\D/g, "");
          invalidByType = !!value && digits.length < 8;
        }
        
        if (invalidByType) {
          const errorMsg = item?.validateMessage || getDefaultValidationMessage(type);
          setError(fieldKey, errorMsg);
          hasError = true;
          return;
        }
        
        // 长度验证
        const minLength = item?.minLength;
        if (typeof minLength === "number" && minLength > 0 && value.length < minLength) {
          const errorMsg = t?.form?.messages?.min_length_error?.replace("{min}", minLength.toString()) || 
            `最少需要 ${minLength} 个字符`;
          setError(fieldKey, errorMsg);
          hasError = true;
          return;
        }
        
        const maxLength = item?.maxLength;
        if (typeof maxLength === "number" && maxLength > -1 && value.length > maxLength) {
          const errorMsg = t?.form?.messages?.max_length_error?.replace("{max}", maxLength.toString()) || 
            `最多 ${maxLength} 个字符`;
          setError(fieldKey, errorMsg);
          hasError = true;
          return;
        }
        
        clearError(fieldKey);
      }
    });

    return hasError;
  };

  // 处理字段值变化
  const handleFieldChange = (fieldKey: string, value: any) => {
    setFieldValues(prev => ({ ...prev, [fieldKey]: value }));
    clearError(fieldKey);
  };

  // 消息提示函数 - 与 Astro 版本一致
  const showMessage = (message: string, type = "info") => {
    const messageDiv = document.createElement("div");
    const bgColor =
      type === "success"
        ? "#10b981"
        : type === "error"
          ? "#ef4444"
          : "#3b82f6";

    messageDiv.style.cssText = `
      position: fixed !important;
      top: 1rem !important;
      right: 1rem !important;
      z-index: 9999 !important;
      padding: 0.5rem 1rem !important;
      border-radius: 0.375rem !important;
      color: white !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      background-color: ${bgColor} !important;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 3000);
  };

  // 提交表单 - 与 Astro 版本完全一致
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查是否有表单字段
    if (!Array.isArray(formStructure) || formStructure.length === 0) {
      showMessage("表单配置错误，请联系管理员", "error");
      return;
    }

    // 验证表单
    const invalid = validate();
    if (invalid) {
      showMessage(t?.form?.messages?.validation_error || "请检查表单填写", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // 组装最终提交数据（固定字段 + 表单字段）
      const payload = {
        formId: formId,
        companyId: companyId,
        visitorSource: 1,
        serverId: '',
        messagePage: window.location.href,
        ...fieldValues,
      };
      
      const visitorId = getCookieValue("_hzVisitorid") || "";
      
      // 组装请求数据
      const requestData = {
        visitorId,
        ...payload,
      };
      
      const response = await fetch(`/api/inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
      console.log('组件请求数据 response', result);
      if(result.success && result.data.code !== '001') {
        throw new Error(result.message);
      }
      console.log('打开成功提示', successMode)
      // 根据successMode显示成功消息
      if (successMode === "modal") {
        setShowModal(true);
      } else {
        // // toast 模式下直接跳转
        // const currentPath = window.location.pathname;
        // const langMatch = currentPath.match(/^\/([a-z]{2}(-[A-Z]{2})?)\//);
        // const lang = langMatch ? langMatch[1] : "";
        // const contactSuccessPath = lang
        //   ? `/${lang}/contact/success`
        //   : "/contact/success";
        // window.location.href = contactSuccessPath;
      }

      // 触发自定义事件，通知其他组件表单提交成功
      document.dispatchEvent(
        new CustomEvent("contactFormSubmitted", {
          detail: { success: true, data: payload },
        }),
      );

      // 重置表单
      setFieldValues({});
      onSuccess?.();

    } catch (error) {
      console.error("表单提交错误:", error);
      const errorMessage = error instanceof Error ? error.message : '提交失败，请稍后重试';
      showMessage(t?.form?.messages?.submit_error || errorMessage, "error");
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 渲染表单字段 - 与 Astro 版本完全一致
  const renderFormField = (item: any, index: number) => {
    const rawType = item?.type ?? item?.componentType ?? item?.inputType;
    const type = normalizeType(rawType, item);
    const fieldName = getFieldName(item, index);
    const preferredKeySource = item?.key ?? item?.code ?? item?.id ?? fieldName;
    const slugFromPreferred = toSlug(preferredKeySource);
    const slugFromName = toSlug(fieldName);
    const fieldKey = slugFromPreferred || slugFromName || `field_${index}`;
    const fieldId = `${fieldKey}`;
    const required = Boolean(
      item?.required ??
      item?.isRequired ??
      item?.require ??
      item?.must ??
      item?.requiredFlag,
    );
    
    const rawLabel = formTrans[item?.label]?.[lang] ?? item?.label;
    const label = i18nFormText(rawLabel);
    const rawPlaceholder = formTrans[item?.prompt]?.[lang] ?? item?.prompt ?? 
      (t.form?.placeholders ? t.form.placeholders[fieldName] : "") ?? "";
    const placeholder = i18nFormText(rawPlaceholder);
    const options = getOptions(item);
    const fullWidth = type === "textarea";
    const defaultRadioKey = String(item?.defaultStatus ?? "");
    const error = errorMap.get(fieldKey);
    const fieldValue = fieldValues[fieldKey] || "";

    return (
      <div key={fieldKey} className={fullWidth ? "md:col-span-2" : ""}>
        {label && (
          <label
            htmlFor={`${fieldId}-${fieldName}`}
            className="block text-2xl font-medium text-gray-700 mb-2"
          >
            {label}
            {required && <span className="text-red-600"> *</span>}
          </label>
        )}
        
        {type === "textarea" ? (
          <textarea
            id={`${fieldId}-${fieldName}`}
            name={fieldName}
            rows={item?.rows ?? 6}
            required={required}
            placeholder={placeholder}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-none"
          />
        ) : type === "select" ? (
          <select
            id={`${fieldId}-${fieldName}`}
            name={fieldName}
            required={required}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          >
            <option value="">{placeholder}</option>
            {options.map((opt: any, idx: number) => {
              const optValue = opt?.dicId;
              const optRawLabel = formTrans[opt?.dicValue]?.[lang] ?? opt?.dicValue;
              const optLabel = i18nFormText(optRawLabel);
              return (
                <option key={idx} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        ) : type === "radio" ? (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {options.map((opt: any, idx: number) => {
              const optId = `${fieldId}-${idx}`;
              const optValue = opt?.key;
              const optRawLabel = formTrans[opt?.value]?.[lang] ?? opt?.value;
              const optLabel = i18nFormText(optRawLabel);
              const optKey = String(opt?.key ?? "");
              const isDefault = defaultRadioKey !== "" && optKey === defaultRadioKey;
              return (
                <label
                  key={idx}
                  htmlFor={optId}
                  className="group inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 cursor-pointer hover:border-red-500 transition-colors"
                >
                  <input
                    type="radio"
                    id={optId}
                    name={fieldName}
                    value={optValue}
                    required={required && idx === 0}
                    checked={fieldValue === optValue || (isDefault && !fieldValue)}
                    onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
                    className="h-4 w-4 accent-red-600 border-gray-300 focus:ring-red-500 focus:outline-none"
                  />
                  <span className="text-gray-700">{optLabel}</span>
                </label>
              );
            })}
          </div>
        ) : type === "checkbox-group" ? (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {options.map((opt: any, idx: number) => {
              const optId = `${fieldId}-${idx}`;
              const optValue = opt?.key;
              const optRawLabel = formTrans[opt?.value]?.[lang] ?? opt?.value;
              const optLabel = i18nFormText(optRawLabel);
              const checkedValues = Array.isArray(fieldValue) ? fieldValue : [];
              
              return (
                <label
                  key={idx}
                  htmlFor={optId}
                  className="group inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 cursor-pointer hover:border-red-500 transition-colors"
                >
                  <input
                    type="checkbox"
                    id={optId}
                    name={fieldName}
                    value={optValue}
                    checked={checkedValues.includes(optValue)}
                    onChange={(e) => {
                      const newValues = e.target.checked 
                        ? [...checkedValues, optValue]
                        : checkedValues.filter(v => v !== optValue);
                      handleFieldChange(fieldKey, newValues);
                    }}
                    className="h-4 w-4 accent-red-600 border-gray-300 focus:ring-red-500 focus:outline-none"
                  />
                  <span className="text-gray-700">{optLabel}</span>
                </label>
              );
            })}
          </div>
        ) : type === "checkbox" ? (
          <input
            type="checkbox"
            id={`${fieldId}-${fieldName}`}
            name={fieldName}
            required={required}
            checked={!!fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.checked ? (item?.value || true) : false)}
            className="h-4 w-4 accent-red-600 border-gray-300 focus:ring-red-500 focus:outline-none"
          />
        ) : (
          <input
            type={type}
            id={`${fieldId}-${fieldName}`}
            name={fieldName}
            required={required}
            placeholder={placeholder}
            value={fieldValue}
            onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
            pattern={item?.pattern}
            minLength={item?.minLength}
            maxLength={item?.maxLength}
            min={item?.min}
            max={item?.max}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
          />
        )}
        
        {error && (
          <p className="mt-1 text-xl text-red-600">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className={`contact-form space-y-6 ${className}`}>
      <form
        id={`${id}-form`}
        onSubmit={handleSubmit}
        noValidate
      >
        {showTitle && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
              <div className="w-1 h-6 bg-red-600 mr-3" />
              {t.form?.title}
            </h2>
            {showDescription && t.form?.description && (
              <p className="text-gray-600">{t.form.description}</p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {Array.isArray(formStructure) &&
            formStructure.length > 0 &&
            formStructure.map((item: any, index: number) => renderFormField(item, index))}
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (t?.form?.messages?.sending) 
              : (t?.form?.send)}
          </button>
        </div>
      </form>

      {/* 成功提交模态框 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all duration-300">
            <div className="p-6 text-center">
              {/* 成功图标 */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* 成功标题 */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t?.form?.messages?.submit_success_model_text}
              </h3>

              {/* 成功描述 */}
              <p className="text-gray-600 mb-6">
                {t?.form?.messages?.submit_success_model_subtitle}
              </p>

              {/* 操作按钮 */}
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    // 触发成功回调事件
                    document.dispatchEvent(
                      new CustomEvent("contactFormSuccessAction", {
                        detail: {
                          action: "close",
                          formId: `${id}-form`,
                          baseId: id,
                        },
                      }),
                    );
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  {t?.form?.messages?.submit_success_model_button}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryForm;
