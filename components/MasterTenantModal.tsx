import React, { useState, useEffect } from 'react';
import type { Tenant, TemplateData } from '../types';

interface MasterTenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { id?: string; name: string; accessibleBaseTemplateIds: string[] }) => void;
    baseTemplates: Record<string, TemplateData>;
    masterTenant: Tenant | null;
}

const MasterTenantModal: React.FC<MasterTenantModalProps> = ({ isOpen, onClose, onSave, baseTemplates, masterTenant }) => {
    const [name, setName] = useState('');
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

    useEffect(() => {
        if (masterTenant) {
            setName(masterTenant.name);
            setSelectedTemplateIds(masterTenant.accessibleBaseTemplateIds || []);
        } else {
            setName('');
            setSelectedTemplateIds([]);
        }
    }, [masterTenant, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim()) {
            onSave({
                id: masterTenant?.id,
                name: name.trim(),
                accessibleBaseTemplateIds: selectedTemplateIds,
            });
        }
    };

    const handleTemplateToggle = (templateId: string) => {
        setSelectedTemplateIds(prev =>
            prev.includes(templateId)
                ? prev.filter(id => id !== templateId)
                : [...prev, templateId]
        );
    };
    
    const isSaveDisabled = !name.trim();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-brand-surface text-slate-800 dark:text-slate-200 rounded-lg shadow-2xl w-full max-w-lg">
                <div className="p-6 border-b border-slate-200 dark:border-brand-dark">
                    <h2 className="text-xl font-bold">{masterTenant ? 'Edit' : 'Create'} Master Tenant</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="masterTenantName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Master Tenant Name</label>
                        <input
                            id="masterTenantName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Global Master"
                            className="w-full bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Accessible Base Templates</label>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-slate-200 dark:border-brand-dark rounded-md">
                            {/* Fix: Iterate over object keys to ensure 'template' is correctly typed as TemplateData, resolving the 'unknown' type error on 'template.name'. */}
                            {Object.keys(baseTemplates).map((id) => {
                                const template = baseTemplates[id];
                                return (
                                <label key={id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-dark cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedTemplateIds.includes(id)}
                                        onChange={() => handleTemplateToggle(id)}
                                        className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
                                    />
                                    <span className="text-sm text-slate-800 dark:text-slate-200">{template.name}</span>
                                </label>
                            );
                            })}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/20 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark/80">Cancel</button>
                    <button onClick={handleSave} disabled={isSaveDisabled} className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary-hover disabled:bg-slate-400 dark:disabled:bg-slate-600">Save</button>
                </div>
            </div>
        </div>
    );
};

export default MasterTenantModal;