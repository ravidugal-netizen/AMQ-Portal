import type { Tenant, ServiceCardData, TemplateData, Role, Supervisor, Agent, Tag, UploadedContent, User } from './types';

/**
 * Creates a deep copy of a TemplateData object.
 * Since icon components are now referenced by string IDs, we can safely use
 * the robust JSON stringify/parse method for a true deep clone.
 * @param template The template object to clone.
 * @returns A new, deep-copied template object.
 */
export const cloneTemplate = (template: TemplateData): TemplateData => {
  return JSON.parse(JSON.stringify(template));
};


const seniorLivingTemplate: TemplateData = {
    templateId: "senior-living",
    name: "Senior Living",
    brand: { name: "Carenza" },
    hero: {
        title: "Welcome to a Life Enriched",
        subtitle: "Discover senior living that goes beyond care - a life full of vitality, connection, and comfort.",
    },
    ctas: {
        primary: { id: 'primary', text: "Explore Communities", url: "#", connectorType: 'URL' },
        secondary: { id: 'secondary', text: "Schedule a Tour", url: "#", connectorType: 'URL' },
    },
    testimonials: [
        { id: 1, quote: "The staff here are like family. We feel so cared for and at home.", author: "Mary S.", title: "Resident" },
        { id: 2, quote: "Finding Carenza was a blessing. My mother has thrived in this wonderful community.", author: "John D.", title: "Family Member" },
    ],
    colorPalette: {
        background: "#0B1225",
        cardBackground: "#1E293B",
        text: "#E2E8F0",
        cardText: "#E2E8F0",
        heroText: "#FFFFFF",
        primary: "#FBBF24",
        secondary: "#334155",
        accent: "#FBBF24",
    },
    serviceCards: [
        { id: 1, icon: "DiningIcon", title: "Dining Menus", description: "View weekly menus, check nutritional info, and make dining reservations.", linkText: "View Menus", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 2, icon: "CalendarIcon", title: "Activity Calendar", description: "Explore daily events, sign up for classes, and see what's happening.", linkText: "See Events", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 3, icon: "HealthcareIcon", title: "Health Services", description: "Schedule nurse appointments and manage your personal wellness plan.", linkText: "Access Health", botId: "hr-bot-1", access: 'Internal', connectorType: 'Bot' },
        { id: 4, icon: "GlobalViewIcon", title: "Transportation", description: "Request a ride for personal errands, appointments, or group outings.", linkText: "Book a Ride", apiEndpoint: "/api/transport", access: 'Internal', connectorType: 'API' },
        { id: 5, icon: "UsersIcon", title: "Family Connect", description: "Share updates, photos, and messages with your loved ones securely.", linkText: "Open Portal", botId: "family-connect-bot", access: 'Both', connectorType: 'Bot' },
        { id: 6, icon: "CogIcon", title: "Maintenance Request", description: "Submit and track requests for repairs or assistance in your residence.", linkText: "New Request", knowledgeBaseId: "kb-it", access: 'Internal', connectorType: 'Knowledge Base' },
        { id: 7, icon: "NewspaperIcon", title: "Community News", description: "Read the latest newsletters, announcements, and important updates.", linkText: "Read News", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 8, icon: "AssistedLivingIcon", title: "Personal Care", description: "Arrange for assistance with daily living activities from our caring staff.", linkText: "Get Assistance", apiEndpoint: "/api/care", access: 'Internal', connectorType: 'API' },
    ],
};

const modernTechTemplate: TemplateData = {
    templateId: "modern-tech",
    name: "Modern Tech",
    brand: { name: "Innovate" },
    hero: {
        title: "Build the Future, Today.",
        subtitle: "Driving innovation with scalable cloud solutions, custom software, and actionable data analytics.",
    },
    ctas: {
        primary: { id: 'primary', text: "Our Solutions", url: "#", connectorType: 'URL' },
        secondary: { id: 'secondary', text: "Contact Sales", url: "#", connectorType: 'URL' },
    },
    testimonials: [
        { id: 1, quote: "Their cloud migration service was seamless and dramatically cut our infrastructure costs.", author: "Jane Doe", title: "CTO, FutureCorp" },
    ],
    colorPalette: {
        background: "#111827",
        cardBackground: "#1F2937",
        text: "#D1D5DB",
        cardText: "#D1D5DB",
        heroText: "#FFFFFF",
        primary: "#4F46E5",
        secondary: "#374151",
        accent: "#EC4899",
    },
    serviceCards: [
        { id: 1, icon: "CloudIcon", title: "Cloud Solutions", description: "Deploy scalable and secure cloud infrastructure tailored to your needs.", linkText: "Explore Services", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 2, icon: "CodeIcon", title: "Custom Software Dev", description: "Build powerful, bespoke applications to drive your business forward.", linkText: "See Our Work", dataMcpId: "mcp-product", access: 'Internal', connectorType: 'Data MCP' },
        { id: 3, icon: "BrainIcon", title: "AI/ML Integration", description: "Leverage artificial intelligence to unlock insights and automate processes.", linkText: "Learn About AI", agentId: "agent-devops", access: 'Internal', connectorType: 'RAG' },
        { id: 4, icon: "DataIcon", title: "Data Analytics", description: "Turn your data into actionable insights with our advanced analytics platform.", linkText: "View Dashboards", knowledgeBaseId: "kb-cybersecurity", access: 'Internal', connectorType: 'Knowledge Base' },
        { id: 5, icon: "ShieldCheckIcon", title: "Cybersecurity Suite", description: "Protect your digital assets with our comprehensive security solutions.", linkText: "Enhance Security", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 6, icon: "CycleIcon", title: "DevOps Automation", description: "Accelerate your development lifecycle with CI/CD and automation.", linkText: "Optimize Workflow", apiEndpoint: "/api/integrations", access: 'Internal', connectorType: 'API' },
        { id: 7, icon: "UrlIcon", title: "API Integrations", description: "Connect your systems seamlessly with our robust API development services.", linkText: "View Docs", botId: "it-support-bot-1", access: 'Internal', connectorType: 'Bot' },
        { id: 8, icon: "SupportIcon", title: "24/7 Tech Support", description: "Get expert assistance whenever you need it from our dedicated support team.", linkText: "Get Support", botId: "sales-bot-1", access: 'Internal', connectorType: 'Bot' },
    ],
};

const elegantSpaTemplate: TemplateData = {
    templateId: "elegant-spa",
    name: "Elegant Spa",
    brand: { name: "Serenity" },
    hero: {
        title: "Your Sanctuary for Serenity.",
        subtitle: "Escape the everyday and indulge in a world of tranquility. Discover bespoke treatments designed to rejuvenate your body, mind, and soul.",
    },
    ctas: {
        primary: { id: 'primary', text: "Book a Treatment", url: "#", connectorType: 'URL' },
        secondary: { id: 'secondary', text: "View Pricelist", url: "#", connectorType: 'URL' },
    },
    testimonials: [
        { id: 1, quote: "An absolutely transcendent experience. The best massage I have ever had. I left feeling completely renewed.", author: "Emily R.", title: "Wellness Blogger" },
    ],
    colorPalette: {
        background: "#F9FAFB",
        cardBackground: "#FFFFFF",
        text: "#374151",
        cardText: "#374151",
        heroText: "#1F2937",
        primary: "#374151",
        secondary: "#E5E7EB",
        accent: "#A855F7",
    },
    serviceCards: [
        { id: 1, icon: "MassageIcon", title: "Signature Massages", description: "Indulge in a variety of therapeutic massages designed to melt stress away.", linkText: "View Massages", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 2, icon: "FacialIcon", title: "Rejuvenating Facials", description: "Revitalize your skin with our custom treatments using premium products.", linkText: "Explore Facials", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 3, icon: "MemoryCareIcon", title: "Body Glow Treatments", description: "Nourish your skin from head to toe with our wraps, scrubs, and polishes.", linkText: "Discover Treatments", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 4, icon: "HandThumbUpIcon", title: "Luxe Manicures & Pedicures", description: "Pamper your hands and feet with our meticulous nail care services.", linkText: "See Nail Services", knowledgeBaseId: "kb-it", access: 'Both', connectorType: 'Knowledge Base' },
        { id: 5, icon: "StarIcon", title: "Exclusive Spa Packages", description: "Experience ultimate relaxation with our curated day packages and retreats.", linkText: "View Packages", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 6, icon: "RelaxIcon", title: "Hydrotherapy Sanctuary", description: "Unwind in our serene vitality pools, steam rooms, and saunas.", linkText: "Explore Sanctuary", apiEndpoint: "/api/memberships", access: 'Internal', connectorType: 'API' },
        { id: 7, icon: "GiftIcon", title: "Purchase Gift Cards", description: "Give the gift of tranquility with a Serenity spa gift card.", linkText: "Buy a Gift", url: "#", access: 'Both', connectorType: 'URL' },
        { id: 8, icon: "CalendarIcon", title: "Reserve Your Visit", description: "Book your next appointment effortlessly with our online scheduling system.", linkText: "Book Now", url: "#", access: 'Both', connectorType: 'URL' },
    ],
};

const corporateHelpdeskTemplate: TemplateData = {
    templateId: "corporate-helpdesk",
    name: "CorpSupport",
    brand: { name: "CorpSupport" },
    hero: {
        title: "Welcome to the Help Center.",
        subtitle: "Your one-stop resource for support, company policies, and IT assistance.",
    },
    ctas: {
        primary: { id: 'primary', text: "Open a Ticket", url: "#", connectorType: 'URL' },
        secondary: { id: 'secondary', text: "Browse Articles", url: "#", connectorType: 'URL' },
    },
    testimonials: [],
    colorPalette: {
        background: "#F3F4F6",
        cardBackground: "#FFFFFF",
        text: "#1F2937",
        cardText: "#1F2937",
        heroText: "#111827",
        primary: "#3B82F6",
        secondary: "#E5E7EB",
        accent: "#3B82F6",
    },
    serviceCards: [
        { id: 1, icon: "ITSupportIcon", title: "IT Support Request", description: "Submit a new ticket for hardware, software, or network issues.", linkText: "Create Ticket", botId: "it-support-bot-1", access: 'Internal', connectorType: 'Bot' },
        { id: 2, icon: "HRDocsIcon", title: "HR & Benefits Info", description: "Access payroll, benefits documentation, and company policies.", linkText: "Go to HR Portal", knowledgeBaseId: "kb-handbook", access: 'Internal', connectorType: 'Knowledge Base' },
        { id: 3, icon: "KnowledgeBaseIcon", title: "Onboarding Resources", description: "Find guides and resources for new hires to get started.", linkText: "View Resources", apiEndpoint: "/api/onboarding", access: 'Internal', connectorType: 'API' },
        { id: 4, icon: "CalendarIcon", title: "Conference Room Booking", description: "View availability and book conference rooms for your meetings.", linkText: "Book a Room", knowledgeBaseId: "kb-it", access: 'Internal', connectorType: 'Knowledge Base' },
        { id: 5, icon: "CodeIcon", title: "Software Access", description: "Request new software licenses or access to company applications.", linkText: "Make Request", knowledgeBaseId: "kb-onboarding", access: 'Internal', connectorType: 'Knowledge Base' },
        { id: 6, icon: "CreditCardIcon", title: "Expense Reporting", description: "Submit and track your business expense reports for reimbursement.", linkText: "Submit Report", url: "#", access: 'Internal', connectorType: 'URL' },
        { id: 7, icon: "UsersIcon", title: "Employee Directory", description: "Find contact information and team details for all colleagues.", linkText: "Search Directory", apiEndpoint: "/api/users", access: 'Internal', connectorType: 'API' },
        { id: 8, icon: "TicketIcon", title: "Facilities Ticket", description: "Report maintenance issues or request supplies for the office.", linkText: "Open Facilities Ticket", botId: "it-support-bot-1", access: 'Internal', connectorType: 'Bot' },
    ],
};

export const initialBaseTemplates: Record<string, TemplateData> = {
    "senior-living": seniorLivingTemplate,
    "modern-tech": modernTechTemplate,
    "elegant-spa": elegantSpaTemplate,
    "corporate-helpdesk": corporateHelpdeskTemplate,
};

const defaultTags: Tag[] = [
    { id: 'tag-public', name: 'Public' },
    { id: 'tag-internal', name: 'Internal' },
    { id: 'tag-finance', name: 'Finance' },
    { id: 'tag-hr', name: 'Human Resources' },
    { id: 'tag-engineering', name: 'Engineering' },
];

const defaultRoles: Role[] = [
    { id: 'role-admin', name: 'Administrator', tagIds: ['tag-public', 'tag-internal', 'tag-finance', 'tag-hr', 'tag-engineering'] },
    { id: 'role-employee', name: 'Employee', tagIds: ['tag-public', 'tag-internal', 'tag-hr'] },
    { id: 'role-finance-mgr', name: 'Finance Manager', tagIds: ['tag-public', 'tag-internal', 'tag-finance'] },
];

const defaultSupervisors: Supervisor[] = [
    { id: 'sup-1', name: 'Jane Smith' },
    { id: 'sup-2', name: 'Robert Brown' },
];

const defaultAgents: Agent[] = [
    { id: 'agent-support-1', name: 'Customer Support Agent', supervisorId: 'sup-1' },
    { id: 'agent-sales-1', name: 'Sales Inquiry Agent', supervisorId: 'sup-1' },
    { id: 'agent-tech-1', name: 'Technical Troubleshooting Agent', supervisorId: 'sup-2' }
];

const defaultUploadedContent: UploadedContent[] = [
    { id: 'doc-1', fileName: 'Q4_Financial_Report.pdf', agentId: 'agent-support-1', tagIds: ['tag-internal', 'tag-finance'], uploadedAt: new Date('2023-10-28').toISOString() },
    { id: 'doc-2', fileName: 'Onboarding_Manual_v3.docx', agentId: 'agent-sales-1', tagIds: ['tag-internal', 'tag-hr'], uploadedAt: new Date('2023-09-15').toISOString() },
];

const oneYearFromNow = new Date();
oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

const tenantsData: Omit<Tenant, 'template' | 'customTemplates' | 'roles' | 'supervisors' | 'agents' | 'tags' | 'uploadedContent' | 'isMaster' | 'accessibleBaseTemplateIds' | 'masterTenantId'>[] = [
  {
    id: 'innovate-corp',
    name: 'Innovate Corp',
    expiryDate: oneYearFromNow.toISOString().split('T')[0],
    maxUserCount: 50,
    stats: {
      totalServices: 2,
      totalConnectors: 4,
      totalInteractions: 12580,
      tenantSince: '15/01/2023',
    },
    services: [
      {
        name: 'HR Helpdesk Bot',
        interactions: 7500,
        connectors: ['Employee Handbook KB', 'Time Off API'],
      },
      {
        name: 'Sales Assistant',
        interactions: 5080,
        connectors: ['Product Catalog MCP', 'Sales Playbook KB'],
      },
    ],
  },
  {
    id: 'quantum-solutions',
    name: 'Quantum Solutions',
    expiryDate: oneYearFromNow.toISOString().split('T')[0],
    maxUserCount: 100,
    stats: {
      totalServices: 3,
      totalConnectors: 5,
      totalInteractions: 21340,
      tenantSince: '02/03/2022',
    },
    services: [
      {
        name: 'IT Support Bot',
        interactions: 11200,
        connectors: ['Knowledge Base', 'Ticketing System API'],
      },
      {
        name: 'Customer Service AI',
        interactions: 8140,
        connectors: ['FAQ Database', 'Live Chat Plugin'],
      },
      {
        name: 'Finance Helper',
        interactions: 2000,
        connectors: ['Expense Reporting API'],
      },
    ],
  },
  {
    id: 'stellar-dynamics',
    name: 'Stellar Dynamics',
    expiryDate: oneYearFromNow.toISOString().split('T')[0],
    maxUserCount: 25,
    stats: {
      totalServices: 1,
      totalConnectors: 2,
      totalInteractions: 8900,
      tenantSince: '10/08/2023',
    },
    services: [
      {
        name: 'Marketing Bot',
        interactions: 8900,
        connectors: ['CRM API', 'Social Media Scheduler'],
      },
    ],
  },
];

export const tenants: Tenant[] = [
    {
        id: 'master-default',
        name: 'Default Master',
        isMaster: true,
        accessibleBaseTemplateIds: Object.keys(initialBaseTemplates),
        expiryDate: '2099-12-31',
        maxUserCount: 999,
        template: cloneTemplate(initialBaseTemplates['corporate-helpdesk']),
        customTemplates: [],
        stats: { totalServices: 0, totalConnectors: 0, totalInteractions: 0, tenantSince: '01/01/2020' },
        services: [],
        roles: [],
        supervisors: [],
        agents: [],
        tags: [],
        uploadedContent: [],
    },
    ...tenantsData.map(tenant => ({
        ...tenant,
        isMaster: false,
        masterTenantId: 'master-default',
        template: cloneTemplate(initialBaseTemplates['senior-living']),
        customTemplates: [],
        roles: JSON.parse(JSON.stringify(defaultRoles)),
        supervisors: JSON.parse(JSON.stringify(defaultSupervisors)),
        agents: JSON.parse(JSON.stringify(defaultAgents)),
        tags: JSON.parse(JSON.stringify(defaultTags)),
        uploadedContent: JSON.parse(JSON.stringify(defaultUploadedContent)),
    }))
];


export const initialUsers: User[] = [
    { id: 'user-super-1', name: 'Super Admin', email: 'super@admin.com', role: 'super-admin', status: 'Active', password: 'password' },
    { id: 'user-master-admin-1', name: 'Master Admin', email: 'master@admin.com', role: 'tenant-admin', tenantId: 'master-default', status: 'Active', password: 'password' },
    { id: 'user-tenant-admin-1', name: 'Alice Tenant Admin', email: 'alice@innovate.corp', role: 'tenant-admin', tenantId: 'innovate-corp', status: 'Active', password: 'password' },
    { id: 'user-tenant-user-1', name: 'Bob Tenant User', email: 'bob@innovate.corp', role: 'tenant-user', tenantId: 'innovate-corp', status: 'Active', password: 'password' },
    { id: 'user-tenant-user-2', name: 'Charlie Pending', email: 'charlie@innovate.corp', role: 'tenant-user', tenantId: 'innovate-corp', status: 'Pending', password: 'password' },
    { id: 'user-tenant-admin-2', name: 'Diana Admin', email: 'diana@quantum.solutions', role: 'tenant-admin', tenantId: 'quantum-solutions', status: 'Active', password: 'password' },
];

export const initialSelectedTenant = tenants.find(t => !t.isMaster) ?? tenants[0];

export const bots = [
    { id: 'hr-bot-1', name: 'HR Helpdesk Bot' },
    { id: 'sales-bot-1', name: 'Sales Assistant Bot' },
    { id: 'it-support-bot-1', name: 'IT Support Bot' },
    { id: 'family-connect-bot', name: 'Family Connection Bot' }
];

export const knowledgeBases = [
    { id: 'kb-handbook', name: 'Employee Handbook KB' },
    { id: 'kb-sales', name: 'Sales Playbook KB' },
    { id: 'kb-it', name: 'IT Support Knowledge Base' },
    { id: 'kb-cybersecurity', name: 'Cybersecurity Best Practices' },
    { id: 'kb-onboarding', name: 'New Hire Onboarding Docs' }
];

export const dataMcps = [
    { id: 'mcp-product', name: 'Product Catalog MCP' },
    { id: 'mcp-customer', name: 'Customer Data MCP' },
    { id: 'mcp-inventory', name: 'Inventory Management MCP' }
];

export const agents = [
    { id: 'agent-support-1', name: 'Customer Support Agent' },
    { id: 'agent-sales-1', name: 'Sales Inquiry Agent' },
    { id: 'agent-tech-1', name: 'Technical Troubleshooting Agent' },
    { id: 'agent-devops', name: 'DevOps Specialist Agent' }
];