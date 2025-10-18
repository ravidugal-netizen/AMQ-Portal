// Fix: Imported useState to resolve 'Cannot find name' errors.
import React, { useState } from 'react';
import type { Tenant, Role, Supervisor, Agent, Tag, UploadedContent, ConfigurationTab } from '../types';

const RolesPanel: React.FC<{ tenant: Tenant, onUpdate: (updates: Partial<Tenant>) => void }> = ({ tenant, onUpdate }) => {
    const [newRoleName, setNewRoleName] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    
    const handleAddRole = () => {
        if (!newRoleName.trim()) return;
        const newRole: Role = {
            id: `role-${Date.now()}`,
            name: newRoleName.trim(),
            tagIds: selectedTagIds,
        };
        onUpdate({ roles: [...tenant.roles, newRole] });
        setNewRoleName('');
        setSelectedTagIds([]);
    };

    const handleTagSelection = (tagId: string) => {
        setSelectedTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-2">Add New Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="Role Name" className="bg-slate-100 dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2" />
                    <div className="space-y-2">
                        <p className="font-medium">Attach Tags:</p>
                        <div className="flex flex-wrap gap-2">
                            {tenant.tags.map(tag => (
                                <button key={tag.id} onClick={() => handleTagSelection(tag.id)} className={`px-2 py-1 text-xs rounded-full ${selectedTagIds.includes(tag.id) ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-brand-dark'}`}>
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={handleAddRole} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover">Add Role</button>
            </div>
            <ul className="space-y-2">
                {tenant.roles.map(role => (
                    <li key={role.id} className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow">
                        <p className="font-bold">{role.name}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {role.tagIds.map(tagId => {
                                const tag = tenant.tags.find(t => t.id === tagId);
                                return tag ? <span key={tagId} className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-brand-dark rounded-full">{tag.name}</span> : null;
                            })}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const SupervisorsPanel: React.FC<{ tenant: Tenant, onUpdate: (updates: Partial<Tenant>) => void }> = ({ tenant, onUpdate }) => {
    const [name, setName] = useState('');
    const handleAdd = () => {
        if (!name.trim()) return;
        const newItem: Supervisor = { id: `sup-${Date.now()}`, name: name.trim() };
        onUpdate({ supervisors: [...tenant.supervisors, newItem] });
        setName('');
    };
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow flex items-center gap-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Supervisor Name" className="flex-grow bg-slate-100 dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2" />
                <button onClick={handleAdd} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover">Add</button>
            </div>
            <ul className="space-y-2">{tenant.supervisors.map(item => <li key={item.id} className="bg-white dark:bg-brand-surface p-3 rounded-lg shadow">{item.name}</li>)}</ul>
        </div>
    );
};

const AgentsPanel: React.FC<{ tenant: Tenant, onUpdate: (updates: Partial<Tenant>) => void }> = ({ tenant, onUpdate }) => {
    const [name, setName] = useState('');
    const [supervisorId, setSupervisorId] = useState<string | null>(null);
    const handleAdd = () => {
        if (!name.trim()) return;
        const newItem: Agent = { id: `agent-${Date.now()}`, name: name.trim(), supervisorId };
        onUpdate({ agents: [...tenant.agents, newItem] });
        setName('');
        setSupervisorId(null);
    };
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Agent Name" className="bg-slate-100 dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2" />
                <select value={supervisorId || ''} onChange={e => setSupervisorId(e.target.value || null)} className="bg-slate-100 dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2">
                    <option value="">No Supervisor</option>
                    {tenant.supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button onClick={handleAdd} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover">Add</button>
            </div>
            <ul className="space-y-2">
                {tenant.agents.map(item => (
                    <li key={item.id} className="bg-white dark:bg-brand-surface p-3 rounded-lg shadow flex justify-between items-center">
                        <span>{item.name}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{tenant.supervisors.find(s => s.id === item.supervisorId)?.name || 'Unassigned'}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const TagsPanel: React.FC<{ tenant: Tenant, onUpdate: (updates: Partial<Tenant>) => void }> = ({ tenant, onUpdate }) => {
    const [name, setName] = useState('');
    const handleAdd = () => {
        if (!name.trim()) return;
        const newItem: Tag = { id: `tag-${Date.now()}`, name: name.trim() };
        onUpdate({ tags: [...tenant.tags, newItem] });
        setName('');
    };
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow flex items-center gap-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tag Name" className="flex-grow bg-slate-100 dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2" />
                <button onClick={handleAdd} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">{tenant.tags.map(item => <span key={item.id} className="bg-white dark:bg-brand-surface p-2 rounded-lg shadow-sm text-sm">{item.name}</span>)}</div>
        </div>
    );
};

const UploadContentPanel: React.FC<{ tenant: Tenant, onUpdate: (updates: Partial<Tenant>) => void }> = ({ tenant, onUpdate }) => {
    const [fileName, setFileName] = useState('');
    const [agentId, setAgentId] = useState<string>('');
    const [tagIds, setTagIds] = useState<string[]>([]);

    const handleAdd = () => {
        if (!fileName.trim() || !agentId) return;
        const newItem: UploadedContent = {
            id: `doc-${Date.now()}`,
            fileName: fileName.trim(),
            agentId,
            tagIds,
            uploadedAt: new Date().toISOString()
        };
        onUpdate({ uploadedContent: [...tenant.uploadedContent, newItem] });
        setFileName('');
        setAgentId('');
        setTagIds([]);
    };
    const handleTagSelection = (tagId: string) => {
        setTagIds(prev => prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]);
    };
    
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-bold">Upload New Content</h3>
                <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} placeholder="File Name (e.g., policy.pdf)" className="w-full bg-slate-100 dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2" />
                <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full bg-slate-100 dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md px-3 py-2">
                    <option value="" disabled>Select an Agent</option>
                    {tenant.agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <div>
                    <p className="font-medium mb-2">Apply Tags:</p>
                    <div className="flex flex-wrap gap-2">
                        {tenant.tags.map(tag => (
                            <button key={tag.id} onClick={() => handleTagSelection(tag.id)} className={`px-2 py-1 text-xs rounded-full ${tagIds.includes(tag.id) ? 'bg-brand-primary text-white' : 'bg-slate-200 dark:bg-brand-dark'}`}>
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={handleAdd} className="w-full px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-hover">Upload</button>
            </div>
            <ul className="space-y-2">
                {tenant.uploadedContent.map(item => (
                    <li key={item.id} className="bg-white dark:bg-brand-surface p-4 rounded-lg shadow">
                        <p className="font-bold">{item.fileName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Agent: {tenant.agents.find(a => a.id === item.agentId)?.name || 'N/A'}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {item.tagIds.map(tagId => {
                                const tag = tenant.tags.find(t => t.id === tagId);
                                return tag ? <span key={tagId} className="px-2 py-0.5 text-xs bg-slate-200 dark:bg-brand-dark rounded-full">{tag.name}</span> : null;
                            })}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const ConfigurationPage: React.FC<{ 
    tenant: Tenant, 
    onUpdate: (updates: Partial<Tenant>) => void,
    activeTab: ConfigurationTab
}> = ({ tenant, onUpdate, activeTab }) => {

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-6">Configuration Management</h2>
            
            <div>
                {activeTab === 'Roles' && <RolesPanel tenant={tenant} onUpdate={onUpdate} />}
                {activeTab === 'Supervisors' && <SupervisorsPanel tenant={tenant} onUpdate={onUpdate} />}
                {activeTab === 'Agents' && <AgentsPanel tenant={tenant} onUpdate={onUpdate} />}
                {activeTab === 'Tags' && <TagsPanel tenant={tenant} onUpdate={onUpdate} />}
                {activeTab === 'Upload Content' && <UploadContentPanel tenant={tenant} onUpdate={onUpdate} />}
            </div>
        </div>
    );
};

export default ConfigurationPage;