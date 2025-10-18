import React from 'react';
import type { Tenant, TemplateData } from '../types';
import { BriefcaseIcon, EditIcon, ShieldCheckIcon, TrashIcon } from '../components/Icons';

interface MasterTenantsPageProps {
    tenants: Tenant[];
    baseTemplates: Record<string, TemplateData>;
    onOpenModal: (tenant: Tenant | null) => void;
    onDelete: (tenant: Tenant) => void;
    onConfigure: (tenant: Tenant) => void;
}

const MasterTenantsPage: React.FC<MasterTenantsPageProps> = ({ tenants, baseTemplates, onOpenModal, onDelete, onConfigure }) => {
    const masterTenants = tenants.filter(t => t.isMaster);

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">Master Tenant Management</h2>
                <button
                    onClick={() => onOpenModal(null)}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-md flex items-center space-x-2"
                >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>New Master Tenant</span>
                </button>
            </div>

            <div className="bg-white dark:bg-brand-surface shadow-lg rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-dark">
                    <thead className="bg-slate-50 dark:bg-black/20">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Accessible Base Templates</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-brand-dark">
                        {masterTenants.map(tenant => (
                            <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-black/10">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{tenant.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {tenant.accessibleBaseTemplateIds?.map(templateId => (
                                            <span key={templateId} className="px-2 py-1 text-xs leading-5 font-semibold rounded-full bg-slate-100 dark:bg-brand-dark text-slate-700 dark:text-slate-300">
                                                {baseTemplates[templateId]?.name || templateId}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => onConfigure(tenant)} title="Configure Tenant" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full"><BriefcaseIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onOpenModal(tenant)} title="Edit Tenant" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => onDelete(tenant)} title="Delete Tenant" className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MasterTenantsPage;
