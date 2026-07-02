export type AppLanguage = "zh-CN" | "en-US";
export type ThemeMode = "light" | "dark" | "system";
export type ThemeScheme = "violet" | "blue" | "green";
export type Density = "compact" | "cozy" | "comfortable";
export type MotionPreference = "full" | "reduced";
export type FontScale = "small" | "default" | "large";

export const DEFAULT_APP_LANGUAGE: AppLanguage = "zh-CN";

export const languageOptions: Array<{ value: AppLanguage; label: string; detailZh: string; detailEn: string }> = [
  { value: "zh-CN", label: "中文", detailZh: "简体中文", detailEn: "Simplified Chinese" },
  { value: "en-US", label: "English", detailZh: "美式英语", detailEn: "United States English" },
];

export const themeOptions: Array<{ value: ThemeMode; labelZh: string; labelEn: string }> = [
  { value: "light", labelZh: "浅色", labelEn: "Light" },
  { value: "dark", labelZh: "深色", labelEn: "Dark" },
  { value: "system", labelZh: "跟随系统", labelEn: "System" },
];

export const schemeOptions: Array<{ value: ThemeScheme; labelZh: string; labelEn: string; swatch: string }> = [
  { value: "violet", labelZh: "紫藤", labelEn: "Violet", swatch: "bg-[#6750A4]" },
  { value: "blue", labelZh: "海蓝", labelEn: "Ocean", swatch: "bg-[#0B65C2]" },
  { value: "green", labelZh: "青木", labelEn: "Juniper", swatch: "bg-[#146C43]" },
];

export const densityOptions: Array<{ value: Density; labelZh: string; labelEn: string }> = [
  { value: "compact", labelZh: "紧凑", labelEn: "Compact" },
  { value: "cozy", labelZh: "标准", labelEn: "Cozy" },
  { value: "comfortable", labelZh: "舒展", labelEn: "Comfortable" },
];

export const motionOptions: Array<{ value: MotionPreference; labelZh: string; labelEn: string }> = [
  { value: "full", labelZh: "完整动效", labelEn: "Full motion" },
  { value: "reduced", labelZh: "减少动效", labelEn: "Reduced motion" },
];

export const fontScaleOptions: Array<{ value: FontScale; labelZh: string; labelEn: string }> = [
  { value: "small", labelZh: "小", labelEn: "Small" },
  { value: "default", labelZh: "标准", labelEn: "Default" },
  { value: "large", labelZh: "大", labelEn: "Large" },
];
