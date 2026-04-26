/**
 * SystemConfig model – mirrors the backend entity.
 * The configMap (key→value) is what the Angular theme engine consumes.
 */
export interface SystemConfig {
  id?: number;
  tenantId: string;
  configKey: string;
  configValue: string;
  configType: 'TEXT' | 'COLOR' | 'URL' | 'JSON' | 'BOOLEAN' | 'NUMBER';
  label?: string;
  description?: string;
  isPublic: boolean;
}

/**
 * Flat key→value map returned by /api/v1/config/public
 * The frontend resolves config keys to their values at startup.
 */
export type ConfigMap = Record<string, string>;

/**
 * Built-in config keys the ERP platform understands.
 * Defined as constants so Angular services and templates reference them safely.
 */
export const CONFIG_KEYS = {
  COMPANY_NAME:     'company.name',
  COMPANY_LOGO_URL: 'company.logoUrl',
  PRIMARY_COLOR:    'theme.primaryColor',
  SECONDARY_COLOR:  'theme.secondaryColor',
  ACCENT_COLOR:     'theme.accentColor',
  FONT_FAMILY:      'theme.fontFamily',
  SIDEBAR_MODULES:  'layout.sidebarModules',   // JSON array of enabled modules
  ENABLED_MODULES:  'layout.sidebarModules',   // alias for backwards compat
  ABOUT_TEXT:       'content.aboutText',
  SUPPORT_EMAIL:    'contact.supportEmail',
} as const;
