import React from 'react';
import type { Tenant, ServiceHelpdesk, CustomTemplate, Theme, User } from '../types';
import InteractionsChart from '../components/InteractionsChart';
import { TrashIcon } from '../components/Icons';

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
  <div className="bg-white dark:bg-brand-surface p-6 rounded-lg shadow-lg">
    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{value.toLocaleString()}</p>
  </div>
);

const ServiceHelpdeskCard: React.FC<{ service: ServiceHelpdesk }> = ({ service }) => (
  <div className="bg-white dark:bg-brand-surface p-6 rounded-lg shadow-lg flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{service.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-green-500 dark:text-green-400 text-sm font-medium">Active</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-brand-primary mt-4">{service.interactions.toLocaleString()}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">interactions this month</p>
      <div className="mt-6">
        <h4 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Connectors</h4>
        <ul className="mt-2 space-y-2">
          {service.connectors.map((connector, index) => (
            <li key={index} className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300">{connector}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    <div className="mt-6 flex items-center space-x-2">
      <button className="bg-slate-200 dark:bg-brand-dark hover:bg-slate-300 dark:hover:bg-brand-dark/80 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-md text-sm w-full">Configure</button>
      <button className="bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold py-2 px-4 rounded-md text-sm w-full">Analytics</button>
    </div>
  </div>
);

const CustomTemplateCard: React.FC<{ customTemplate: CustomTemplate, onEdit: () => void }> = ({ customTemplate, onEdit }) => (
  <div className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow-lg flex items-center justify-between">
    <div>
      <h3 className="font-bold text-slate-900 dark:text-white">{customTemplate.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Saved: {new Date(customTemplate.savedAt).toLocaleDateString()}</p>
    </div>
    <button onClick={onEdit} className="bg-slate-200 dark:bg-brand-dark hover:bg-slate-300 dark:hover:bg-brand-dark/80 text-slate-800 dark:text-white font-semibold py-2 px-4 rounded-md text-sm">
      Edit
    </button>
  </div>
);


const DashboardPage: React.FC<{ 
    user: User;
    tenant: Tenant;
    tenants: Tenant[];
    onEditCustomTemplate: (id: string) => void;
    onDeleteTenant: (tenant: Tenant) => void;
    theme: Theme;
}> = ({ user, tenant, tenants, onEditCustomTemplate, onDeleteTenant, theme }) => {
  const chartData = tenant.services.map(service => ({
    name: service.name,
    Interactions: service.interactions,
  }));
  
  const canDelete = user.role === 'super-admin' && (tenant.isMaster || tenants.filter(t => !t.isMaster).length > 1);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Dashboard Overview</h2>
          {user.role === 'super-admin' && (
            <button
                onClick={() => onDeleteTenant(tenant)}
                disabled={!canDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md flex items-center space-x-2 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                title={!canDelete ? "Cannot delete the last regular tenant" : `Delete ${tenant.name}`}
            >
                <TrashIcon className="w-5 h-5" />
                <span>Delete Tenant</span>
            </button>
          )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Services" value={tenant.stats.totalServices} />
        <StatCard title="Total Connectors" value={tenant.stats.totalConnectors} />
        <StatCard title="Total Interactions" value={tenant.stats.totalInteractions} />
        <StatCard title="Tenant Since" value={tenant.stats.tenantSince} />
      </div>

      <div className="mt-8 bg-white dark:bg-brand-surface p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Interactions per Service</h2>
        <div className="h-80">
          <InteractionsChart data={chartData} theme={theme} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Service Helpdesks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenant.services.map((service, index) => (
            <ServiceHelpdeskCard key={index} service={service} />
          ))}
        </div>
      </div>
      
      {tenant.customTemplates.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Custom Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenant.customTemplates.map((ct) => (
                <CustomTemplateCard key={ct.id} customTemplate={ct} onEdit={() => onEditCustomTemplate(ct.id)} />
              ))}
            </div>
          </div>
      )}

    </div>
  );
};

export default DashboardPage;