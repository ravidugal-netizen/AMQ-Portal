import React, { useState, useEffect, useMemo } from 'react';
import type { Tenant, TemplateData, Role, Supervisor, Agent, Tag } from '../types';

interface NewTenantData {
    name: string;
    expiryDate: string;
    maxUserCount: number;
    masterTenantId: string;
    accessibleBaseTemplateIds: string[];
    roleIds: string[];
    supervisorIds: string[];
    agentIds: string[];
    tagIds: string[];
}

interface NewTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NewTenantData) => void;
    masterTenants: Tenant[];
    tenants: Tenant[];
    baseTemplates: Record<string, TemplateData>;
}

const ConfigSection: React.FC<{
    title: string;
    items: (Role | Supervisor | Agent | Tag)[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}> = ({ title, items, selectedIds, onToggle }) => {
    if (items.length === 0) return null;

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-brand-dark rounded-md">
                {items.map(item => (
                    <label key={item.id} className="flex items-center space-x-3 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-brand-dark cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => onToggle(item.id)}
                            className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                        />
                        <span className="text-sm text-slate-800 dark:text-slate-200">{item.name}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};


const NewTenantModal: React.FC<NewTenantModalProps> = ({ isOpen, onClose, onSave, masterTenants, tenants, baseTemplates }) => {
    const [name, setName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [maxUserCount, setMaxUserCount] = useState(10);
    const [masterTenantId, setMasterTenantId] = useState<string>(masterTenants[0]?.id || '');
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
    
    // State for inheritable configs
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [selectedSupervisorIds, setSelectedSupervisorIds] = useState<string[]>([]);
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

    const selectedMasterTenant = useMemo(() => {
        return tenants.find(t => t.id === masterTenantId);
    }, [masterTenantId, tenants]);

    useEffect(() => {
        if (isOpen && selectedMasterTenant) {
            setSelectedTemplateIds(selectedMasterTenant.accessibleBaseTemplateIds || []);
            setSelectedRoleIds(selectedMasterTenant.roles.map(r => r.id));
            setSelectedSupervisorIds(selectedMasterTenant.supervisors.map(s => s.id));
            setSelectedAgentIds(selectedMasterTenant.agents.map(a => a.id));
            setSelectedTagIds(selectedMasterTenant.tags.map(t => t.id));
        }
    }, [selectedMasterTenant, isOpen]);


    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim() && expiryDate && maxUserCount > 0 && masterTenantId) {
            onSave({
                name: name.trim(), 
                expiryDate, 
                maxUserCount, 
                masterTenantId, 
                accessibleBaseTemplateIds: selectedTemplateIds,
                roleIds: selectedRoleIds,
                supervisorIds: selectedSupervisorIds,
                agentIds: selectedAgentIds,
                tagIds: selectedTagIds
            });
            // Reset form
            setName('');
            setExpiryDate('');
            setMaxUserCount(10);
            setMasterTenantId(masterTenants[0]?.id || '');
        }
    };
    
    const handleTemplateToggle = (templateId: string) => {
        setSelectedTemplateIds(prev => prev.includes(templateId) ? prev.filter(id => id !== templateId) : [...prev, templateId]);
    };

    const isSaveDisabled = !name.trim() || !expiryDate || maxUserCount <= 0 || !masterTenantId;

    const masterTenantTemplates = selectedMasterTenant?.accessibleBaseTemplateIds || [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-brand-surface text-slate-800 dark:text-slate-200 rounded-lg shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-slate-200 dark:border-brand-dark">
                    <h2 className="text-xl font-bold">Create New Tenant</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enter the details and select configurations to inherit.</p>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="tenantName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tenant Name</label>
                        <input
                            id="tenantName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Quantum Solutions"
                            className="w-full bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                    </div>
                     <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                        <input
                            id="expiryDate"
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                    </div>
                     <div>
                        <label htmlFor="maxUserCount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Maximum User Count</label>
                        <input
                            id="maxUserCount"
                            type="number"
                            min="1"
                            value={maxUserCount}
                            onChange={(e) => setMaxUserCount(parseInt(e.target.value, 10))}
                            className="w-full bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="masterTenantId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inherit From Master Tenant</label>
                        <select
                            id="masterTenantId"
                            value={masterTenantId}
                            onChange={(e) => setMasterTenantId(e.target.value)}
                            className="w-full bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        >
                            {masterTenants.map(mt => (
                                <option key={mt.id} value={mt.id}>{mt.name}</option>
                            ))}
                        </select>
                    </div>
                    {masterTenantId && (
                        <div className="p-3 border border-slate-200 dark:border-brand-dark rounded-md space-y-4">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Configuration Inheritance</h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Base Template Access
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 dark:border-brand-dark rounded-md">
                                    {masterTenantTemplates.length > 0 ? masterTenantTemplates.map(id => {
                                        const template = baseTemplates[id];
                                        if (!template) return null;
                                        return (
                                            <label key={id} className="flex items-center space-x-3 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-brand-dark cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTemplateIds.includes(id)}
                                                    onChange={() => handleTemplateToggle(id)}
                                                    className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                                />
                                                <span className="text-sm text-slate-800 dark:text-slate-200">{template.name}</span>
                                            </label>
                                        )
                                    }) : (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 col-span-2 text-center">No base templates available in this master tenant.</p>
                                    )}
                                </div>
                            </div>
                            <ConfigSection title="Roles" items={selectedMasterTenant?.roles || []} selectedIds={selectedRoleIds} onToggle={(id) => setSelectedRoleIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])} />
                            <ConfigSection title="Supervisors" items={selectedMasterTenant?.supervisors || []} selectedIds={selectedSupervisorIds} onToggle={(id) => setSelectedSupervisorIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])} />
                            <ConfigSection title="Agents" items={selectedMasterTenant?.agents || []} selectedIds={selectedAgentIds} onToggle={(id) => setSelectedAgentIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])} />
                            <ConfigSection title="Tags" items={selectedMasterTenant?.tags || []} selectedIds={selectedTagIds} onToggle={(id) => setSelectedTagIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id])} />
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/20 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark/80">Cancel</button>
                    <button onClick={handleSave} disabled={isSaveDisabled} className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary-hover disabled:bg-slate-400 dark:disabled:bg-slate-600">Create Tenant</button>
                </div>
            </div>
        </div>
    );
};

export default NewTenantModal;