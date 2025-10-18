export interface CustomTemplate {
  id: string;
  name: string;
  savedAt: string;
  template: TemplateData;
}

// Service Management Types
export type ConfigurationTab = 'Roles' | 'Supervisors' | 'Agents' | 'Tags' | 'Upload Content';

export interface Tag {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
  tagIds: string[];
}

export interface Supervisor {
  id: string;
  name: string;
}

export interface Agent {
  id: string;
  name: string;
  supervisorId: string | null;
}

export interface UploadedContent {
  id: string;
  fileName: string;
  agentId: string;
  tagIds: string[];
  uploadedAt: string;
}

export interface Tenant {
  id:string;
  name: string;
  isMaster?: boolean;
  accessibleBaseTemplateIds?: string[];
  masterTenantId?: string;
  expiryDate: string; // ISO date string
  maxUserCount: number;
  template: TemplateData;
  customTemplates: CustomTemplate[];
  stats: {
    totalServices: number;
    totalConnectors: number;
    totalInteractions: number;
    tenantSince: string;
  };
  services: ServiceHelpdesk[];
  // RAG and RBAC data
  roles: Role[];
  supervisors: Supervisor[];
  agents: Agent[];
  tags: Tag[];
  uploadedContent: UploadedContent[];
}

export interface ServiceHelpdesk {
  name:string;
  interactions: number;
  connectors: string[];
}

export interface InteractionsChartData {
  name: string;
  Interactions: number;
}

export interface ServiceCardData {
  id: number;
  icon: string;
  title: string;
  description: string;
  linkText: string;
  url?: string;
  botId?: string;
  knowledgeBaseId?: string;
  playlistId?: string;
  dataMcpId?: string;
  apiEndpoint?: string;
  agentId?: string;
  access: 'Both' | 'Internal' | 'External';
  connectorType: 'URL' | 'Bot' | 'Knowledge Base' | 'Learning Videos' | 'Data MCP' | 'API' | 'RAG';
}

export interface ColorPalette {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  accent: string;
  cardBackground: string;
  cardText: string;
  heroText: string;
}

export interface CtaConfig {
  id: 'primary' | 'secondary';
  text: string;
  url?: string;
  botId?: string;
  knowledgeBaseId?: string;
  playlistId?: string;
  dataMcpId?: string;
  apiEndpoint?: string;
  agentId?: string;
  connectorType: 'URL' | 'Bot' | 'Knowledge Base' | 'Learning Videos' | 'Data MCP' | 'API' | 'RAG';
}

export interface CtaDataSet {
  primary: CtaConfig;
  secondary: CtaConfig;
}

export interface TestimonialData {
  id: number;
  quote: string;
  author: string;
  title: string;
}

export interface BrandData {
  name: string;
  logoUrl?: string;
}

export interface TemplateData {
  templateId: string;
  name: string;
  hero: {
    title: string;
    subtitle: string;
  };
  ctas: CtaDataSet;
  brand: BrandData;
  testimonials: TestimonialData[];
  colorPalette: ColorPalette;
  serviceCards: ServiceCardData[];
}

export type Page = 'dashboard' | 'templates' | 'configuration' | 'users' | 'master-tenants';

export type Theme = 'light' | 'dark';

export type ViewMode = 'Edit' | 'Preview';
export type ViewAs = 'Internal' | 'External';

// --- Role-Based Access Control ---
export type UserRole = 'super-admin' | 'tenant-admin' | 'tenant-user';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    tenantId?: string; // Only for tenant-admin and tenant-user
    status: 'Active' | 'Pending';
    password?: string;
}