import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { cloneTemplate, initialBaseTemplates, tenants as initialTenantsConstant, initialUsers } from './constants';
import type { Tenant, Page, TemplateData, CustomTemplate, Theme, User, ConfigurationTab } from './types';
import { AnswerMyQIcon, BellIcon, ChevronDownIcon, ChevronUpIcon, ChevronRightIcon, CogIcon, HomeIcon, SearchIcon, TemplateIcon, UsersIcon, ShieldCheckIcon, MicrophoneIcon, TagIcon, UploadIcon, LogoutIcon, TrashIcon, BriefcaseIcon } from './components/Icons';
import DashboardPage from './pages/Dashboard';
import TemplateEditorPage from './pages/TemplateEditor';
import SettingsModal from './components/SettingsModal';
import ConfigurationPage from './pages/ServicesPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import NewTenantModal from './components/NewTenantModal';
import DeleteTenantModal from './components/DeleteTenantModal';
import MasterTenantsPage from './pages/MasterTenantsPage';
import MasterTenantModal from './components/MasterTenantModal';


const CURRENT_DATA_VERSION = '2.4'; // Increment this on breaking data structure changes
const DATA_VERSION_KEY = 'amq-portal-data-version';
const APP_STORAGE_KEYS = [
    'amq-portal-user',
    'amq-portal-tenants',
    'amq-portal-users',
    'amq-portal-selected-tenant-id',
    'amq-portal-theme',
    'amq-portal-base-templates',
];

// --- Data Persistence & Migration ---
// This block runs once when the app loads. It checks if the stored data is
// compatible with the current version of the app. If not, it clears all
// app-related data from localStorage to prevent crashes due to old data structures.
try {
    const storedVersion = localStorage.getItem(DATA_VERSION_KEY);
    if (storedVersion !== CURRENT_DATA_VERSION) {
        console.warn(
            `Local data version mismatch (stored: ${storedVersion}, app: ${CURRENT_DATA_VERSION}). Clearing stored data to prevent errors.`
        );
        [...APP_STORAGE_KEYS, DATA_VERSION_KEY].forEach(key => {
            localStorage.removeItem(key);
        });
        // Set the new version after clearing
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    }
} catch (error) {
    console.error('Failed to handle data versioning. Clearing storage as a precaution.', error);
     [...APP_STORAGE_KEYS, DATA_VERSION_KEY].forEach(key => {
        localStorage.removeItem(key);
    });
}


const Header: React.FC<{
    user: User;
    onLogout: () => void;
    tenants: Tenant[];
    selectedTenant: Tenant;
    onSelectTenant: (tenant: Tenant) => void;
    onOpenNewTenantModal: () => void;
    onOpenDeleteTenantModal: (tenant: Tenant) => void;
}> = ({ user, onLogout, tenants, selectedTenant, onSelectTenant, onOpenNewTenantModal, onOpenDeleteTenantModal }) => {
  const [isTenantDropdownOpen, setIsTenantDropdownOpen] = useState(false);
  
  const regularTenants = useMemo(() => tenants.filter(t => !t.isMaster), [tenants]);
  const tenantsForDropdown = useMemo(() => tenants.sort((a, b) => a.name.localeCompare(b.name)), [tenants]);

  return (
    <header className="bg-white dark:bg-brand-surface border-b border-slate-200 dark:border-brand-dark p-4 flex items-center justify-between col-span-2">
      <div className="flex items-center">
         {user.role === 'super-admin' ? (
              <div className="relative">
                <button 
                  onClick={() => setIsTenantDropdownOpen(prev => !prev)}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-brand-dark"
                >
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTenant.name}</h1>
                  {selectedTenant.isMaster && <ShieldCheckIcon className="w-5 h-5 text-purple-500 ml-2" />}
                  {isTenantDropdownOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-500" /> : <ChevronDownIcon className="w-5 h-5 text-slate-500" />}
                </button>
                {isTenantDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-72 bg-white dark:bg-brand-surface rounded-md shadow-lg border border-slate-200 dark:border-brand-dark max-h-60 overflow-y-auto">
                    <ul>
                      {tenantsForDropdown.map((tenant) => (
                        <li 
                          key={tenant.id}
                          onClick={() => { onSelectTenant(tenant); setIsTenantDropdownOpen(false); }}
                          className={`group flex items-center justify-between p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-brand-dark ${selectedTenant.id === tenant.id ? 'text-brand-primary' : 'text-slate-900 dark:text-white'}`}
                        >
                          <span className="flex items-center">
                            {tenant.name}
                            {tenant.isMaster && <ShieldCheckIcon className="w-4 h-4 text-purple-400 ml-2" title="Master Tenant" />}
                          </span>
                           <div className="flex items-center space-x-1">
                                {selectedTenant.id === tenant.id && <ChevronRightIcon className="w-5 h-5" />}
                                {(regularTenants.length > 1 || tenant.isMaster) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onOpenDeleteTenantModal(tenant);
                                            setIsTenantDropdownOpen(false);
                                        }}
                                        className="p-1 rounded-full text-slate-400 hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title={`Delete ${tenant.name}`}
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </li>
                      ))}
                      <li className="border-t border-slate-200 dark:border-brand-dark p-1">
                        <button onClick={() => { onOpenNewTenantModal(); setIsTenantDropdownOpen(false); }} className="w-full text-left p-2 text-sm text-brand-primary hover:bg-slate-100 dark:hover:bg-brand-dark rounded-md">+ New Tenant</button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTenant.name}</h1>
            )}
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search..."
            className="bg-slate-100 dark:bg-brand-dark border border-slate-300 dark:border-brand-dark rounded-md pl-10 pr-4 py-2 w-64 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
        <button className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-brand-dark">
          <BellIcon className="w-6 h-6 text-slate-500 dark:text-slate-300" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-brand-dark flex items-center justify-center font-bold text-slate-800 dark:text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user.role.replace('-', ' ')}</p>
          </div>
          <button onClick={onLogout} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-brand-dark" title="Logout">
            <LogoutIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};

const Sidebar: React.FC<{
  user: User;
  currentPage: Page;
  onNavigate: (page: Page, subPage?: ConfigurationTab) => void;
  onOpenSettings: () => void;
}> = ({ user, currentPage, onNavigate, onOpenSettings }) => {
  return (
    <aside className="bg-white dark:bg-brand-surface border-r border-slate-200 dark:border-brand-dark flex flex-col justify-between">
      <div>
        <div className="p-4 border-b border-slate-200 dark:border-brand-dark flex items-center space-x-3">
          <AnswerMyQIcon />
          <span className="text-2xl font-bold text-slate-900 dark:text-white">AnswerMyQ</span>
        </div>
        <nav className="p-4">
          <ul>
            <li
              className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer ${currentPage === 'dashboard' ? 'bg-brand-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-brand-dark text-slate-600 dark:text-slate-300'}`}
              onClick={() => onNavigate('dashboard')}
            >
              <HomeIcon className="w-6 h-6" />
              <span>Overview</span>
            </li>
            <li
              className={`flex items-center space-x-3 p-2 mt-2 rounded-md cursor-pointer ${currentPage === 'templates' ? 'bg-brand-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-brand-dark text-slate-600 dark:text-slate-300'}`}
              onClick={() => onNavigate('templates')}
            >
              <TemplateIcon className="w-6 h-6" />
              <span>Templates</span>
            </li>
            {user.role === 'super-admin' && (
                <li
                    className={`flex items-center space-x-3 p-2 mt-2 rounded-md cursor-pointer ${currentPage === 'master-tenants' ? 'bg-brand-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-brand-dark text-slate-600 dark:text-slate-300'}`}
                    onClick={() => onNavigate('master-tenants')}
                >
                    <ShieldCheckIcon className="w-6 h-6" />
                    <span>Master Tenants</span>
                </li>
            )}
            <li
              className={`flex items-center space-x-3 p-2 mt-2 rounded-md cursor-pointer ${currentPage === 'configuration' ? 'bg-brand-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-brand-dark text-slate-600 dark:text-slate-300'}`}
              onClick={() => onNavigate('configuration', 'Roles')}
            >
              <BriefcaseIcon className="w-6 h-6" />
              <span>Configuration</span>
            </li>
            <li
              className={`flex items-center space-x-3 p-2 mt-2 rounded-md cursor-pointer ${currentPage === 'users' ? 'bg-brand-primary text-white' : 'hover:bg-slate-200 dark:hover:bg-brand-dark text-slate-600 dark:text-slate-300'}`}
              onClick={() => onNavigate('users')}
            >
              <UsersIcon className="w-6 h-6" />
              <span>Users</span>
            </li>
          </ul>
        </nav>
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-brand-dark">
        <button onClick={onOpenSettings} className="flex items-center w-full space-x-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-brand-dark text-slate-600 dark:text-slate-300">
          <CogIcon className="w-6 h-6" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

const SubHeader: React.FC<{
    currentPage: Page;
    activeConfigurationTab: ConfigurationTab;
    onNavigate: (page: Page, subPage?: ConfigurationTab) => void;
}> = ({ currentPage, activeConfigurationTab, onNavigate }) => {
    if (currentPage !== 'configuration') return null;

    const tabs: ConfigurationTab[] = ['Roles', 'Supervisors', 'Agents', 'Tags', 'Upload Content'];

    return (
        <div className="flex-shrink-0 bg-white dark:bg-brand-surface border-b border-slate-200 dark:border-brand-dark px-6">
            <nav className="-mb-px flex space-x-6">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => onNavigate('configuration', tab)}
                        className={`py-3 text-sm font-semibold border-b-2 transition-colors focus:outline-none ${
                            activeConfigurationTab === tab
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                        aria-current={activeConfigurationTab === tab ? 'page' : undefined}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    );
};

const usePersistentState = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage key “${key}”, removing corrupt data:`, error);
      localStorage.removeItem(key); // Remove the invalid data
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
      // Ensure the version is always up-to-date when we write data
      localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION);
    } catch (error) {
      console.error(`Error writing to localStorage key “${key}”:`, error);
    }
  }, [key, state]);

  return [state, setState];
};

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

export default function App() {
  const [user, setUser] = usePersistentState<User | null>('amq-portal-user', null);
  const [tenants, setTenants] = usePersistentState<Tenant[]>('amq-portal-tenants', initialTenantsConstant);
  const [users, setUsers] = usePersistentState<User[]>('amq-portal-users', initialUsers);
  const [baseTemplates, setBaseTemplates] = usePersistentState<Record<string, TemplateData>>('amq-portal-base-templates', initialBaseTemplates);
  
  const [selectedTenantId, setSelectedTenantId] = usePersistentState<string | null>(
    'amq-portal-selected-tenant-id', 
    user?.role === 'tenant-admin' ? user.tenantId! : (tenants.find(t => !t.isMaster)?.id || null)
  );
  
  const selectedTenant = tenants.find(t => t.id === selectedTenantId)
    || (user?.role !== 'super-admin' ? tenants.find(t => t.id === user?.tenantId) : undefined)
    || tenants.find(t => !t.isMaster) 
    || tenants[0];
  
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [activeConfigurationTab, setActiveConfigurationTab] = useState<ConfigurationTab>('Roles');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewTenantModalOpen, setIsNewTenantModalOpen] = useState(false);
  const [isDeleteTenantModalOpen, setIsDeleteTenantModalOpen] = useState(false);
  const [isMasterTenantModalOpen, setIsMasterTenantModalOpen] = useState(false);
  const [editingMasterTenant, setEditingMasterTenant] = useState<Tenant | null>(null);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isFullScreenPreview, setIsFullScreenPreview] = useState(false);
  
  const masterTenants = useMemo(() => tenants.filter(t => t.isMaster), [tenants]);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('amq-portal-theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
        // If no theme is saved (e.g., after clearing storage), set a default
        setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('amq-portal-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    if (user?.role === 'tenant-admin' && user.tenantId) {
        setSelectedTenantId(user.tenantId);
    } else if (user?.role === 'super-admin' && (!selectedTenantId || !tenants.some(t => t.id === selectedTenantId))) {
        setSelectedTenantId(tenants.find(t => !t.isMaster)?.id || null);
    }
  }, [user, tenants, selectedTenantId, setSelectedTenantId]);

  const handleLogin = (loggedInUser: User) => {
    if (loggedInUser.role !== 'super-admin') {
        const tenant = tenants.find(t => t.id === loggedInUser.tenantId);
        if (tenant && new Date() > new Date(tenant.expiryDate)) {
            alert('This tenant account has expired. Please contact your administrator.');
            return;
        }
    }
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedTenantId(null);
    setCurrentPage('dashboard');
    localStorage.removeItem('amq-portal-user');
    localStorage.removeItem('amq-portal-selected-tenant-id');
  };
  
  const handleCreateTenant = (data: NewTenantData) => {
    const masterTenant = tenants.find(t => t.id === data.masterTenantId);
    if (!masterTenant) return;

    const newRoles = masterTenant.roles.filter(r => data.roleIds.includes(r.id));
    const newSupervisors = masterTenant.supervisors.filter(s => data.supervisorIds.includes(s.id));
    const newAgents = masterTenant.agents.filter(a => data.agentIds.includes(a.id));
    const newTags = masterTenant.tags.filter(t => data.tagIds.includes(t.id));
    
    const newTenant: Tenant = {
        id: data.name.toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`,
        name: data.name,
        expiryDate: data.expiryDate,
        maxUserCount: data.maxUserCount,
        masterTenantId: data.masterTenantId,
        accessibleBaseTemplateIds: data.accessibleBaseTemplateIds,
        isMaster: false,
        template: cloneTemplate(baseTemplates['senior-living']),
        customTemplates: [],
        stats: { totalServices: 0, totalConnectors: 0, totalInteractions: 0, tenantSince: new Date().toLocaleDateString('en-GB') },
        services: [],
        roles: JSON.parse(JSON.stringify(newRoles)),
        supervisors: JSON.parse(JSON.stringify(newSupervisors)),
        agents: JSON.parse(JSON.stringify(newAgents)),
        tags: JSON.parse(JSON.stringify(newTags)),
        uploadedContent: []
    };
    setTenants(prev => [...prev, newTenant]);
    setIsNewTenantModalOpen(false);
  };
  
  const handleSaveMasterTenant = (data: { id?: string; name: string; accessibleBaseTemplateIds: string[] }) => {
    if (data.id) { // Editing existing
        setTenants(prev => prev.map(t => t.id === data.id ? { ...t, name: data.name, accessibleBaseTemplateIds: data.accessibleBaseTemplateIds } : t));
    } else { // Creating new
        const newMasterTenant: Tenant = {
            id: data.name.toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`,
            name: data.name,
            isMaster: true,
            accessibleBaseTemplateIds: data.accessibleBaseTemplateIds,
            expiryDate: '2099-12-31',
            maxUserCount: 999,
            template: cloneTemplate(baseTemplates['corporate-helpdesk']),
            customTemplates: [],
            stats: { totalServices: 0, totalConnectors: 0, totalInteractions: 0, tenantSince: new Date().toLocaleDateString('en-GB') },
            services: [], roles: [], supervisors: [], agents: [], tags: [], uploadedContent: [],
        };
        setTenants(prev => [...prev, newMasterTenant]);
    }
    setIsMasterTenantModalOpen(false);
    setEditingMasterTenant(null);
  };

  const handleOpenDeleteTenantModal = (tenant: Tenant) => {
    if (tenants.filter(t => !t.isMaster).length <= 1 && !tenant.isMaster) {
        alert("You cannot delete the last tenant.");
        return;
    };
    setTenantToDelete(tenant);
    setIsDeleteTenantModalOpen(true);
  };

  const handleDeleteTenant = () => {
    if (!tenantToDelete) return;

    if (tenantToDelete.isMaster) {
        const isMasterInUse = tenants.some(t => !t.isMaster && t.masterTenantId === tenantToDelete.id);
        if (isMasterInUse) {
            alert(`Cannot delete Master Tenant "${tenantToDelete.name}" as it's assigned to regular tenants.`);
            setIsDeleteTenantModalOpen(false);
            setTenantToDelete(null);
            return;
        }
    }
    
    setTenants(prevTenants => {
      const newTenants = prevTenants.filter(t => t.id !== tenantToDelete.id);
      if (selectedTenantId === tenantToDelete.id) {
        setSelectedTenantId(newTenants.find(t => !t.isMaster)?.id || newTenants.find(t => t.isMaster)?.id || null);
      }
      return newTenants;
    });

    setIsDeleteTenantModalOpen(false);
    setTenantToDelete(null);
  };

  const handleAddUser = (newUser: Omit<User, 'id' | 'status'>) => {
      const userWithId: User = {
          ...newUser,
          id: `user-${Date.now()}`,
          status: 'Active', // New users are active immediately to allow login
      };
      setUsers(prev => [...prev, userWithId]);
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  };


  const handleSelectTenant = useCallback((tenant: Tenant) => {
    if(user?.role === 'super-admin') {
      setSelectedTenantId(tenant.id);
    }
  }, [user, setSelectedTenantId]);

  const handleNavigate = useCallback((page: Page, subPage?: ConfigurationTab) => {
    setCurrentPage(page);
    if (page === 'configuration' && subPage) {
        setActiveConfigurationTab(subPage);
    }
  }, []);

  const updateTenantData = useCallback((tenantId: string, updates: Partial<Tenant>) => {
    setTenants(prevTenants => prevTenants.map(t => t.id === tenantId ? { ...t, ...updates } : t));
  }, [setTenants]);

  const handleUpdateTemplate = useCallback((updatedTemplate: TemplateData) => {
    if (!selectedTenant) return;
    updateTenantData(selectedTenant.id, { template: updatedTemplate });
  }, [selectedTenant, updateTenantData]);

  const handleSaveTemplate = useCallback((name: string) => {
    if (!selectedTenant) return;
    const newCustomTemplate: CustomTemplate = {
      id: `custom-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      template: selectedTenant.template,
    };
    updateTenantData(selectedTenant.id, { customTemplates: [...(selectedTenant.customTemplates || []), newCustomTemplate] });
  }, [selectedTenant, updateTenantData]);

  const handleSaveAsBaseTemplate = useCallback((name: string, templateData: TemplateData) => {
      const newId = name.toLowerCase().replace(/\s+/g, '-') + `-${Date.now()}`;
      const newBaseTemplate: TemplateData = {
          ...cloneTemplate(templateData),
          templateId: newId,
          name: name,
      };
      setBaseTemplates(prev => ({ ...prev, [newId]: newBaseTemplate }));
  }, [setBaseTemplates]);
  
  const handleDeleteBaseTemplate = useCallback((templateId: string) => {
    setBaseTemplates(prev => {
        const newTemplates = { ...prev };
        delete newTemplates[templateId];
        return newTemplates;
    });
  }, [setBaseTemplates]);

  const handleLoadTemplate = useCallback((customTemplateId: string) => {
    if (!selectedTenant) return;
    const customTemplates = selectedTenant.customTemplates || [];
    const saved = customTemplates.find(st => st.id === customTemplateId);
    if (saved) {
      handleUpdateTemplate(saved.template);
    }
  }, [selectedTenant, handleUpdateTemplate]);

  const handleDeleteCustomTemplate = useCallback((customTemplateId: string) => {
    if (!selectedTenant) return;
    const customTemplates = selectedTenant.customTemplates || [];
    const updatedCustomTemplates = customTemplates.filter(st => st.id !== customTemplateId);
    updateTenantData(selectedTenant.id, { customTemplates: updatedCustomTemplates });
  }, [selectedTenant, updateTenantData]);

  const handleEditCustomTemplate = useCallback((customTemplateId: string) => {
      handleLoadTemplate(customTemplateId);
      handleNavigate('templates');
  }, [handleLoadTemplate, handleNavigate]);
  
  const handleUpdateConfiguration = (updates: Partial<Tenant>) => {
      if (!selectedTenant) return;
      updateTenantData(selectedTenant.id, updates);
  };
  
  const handleConfigureMasterTenant = useCallback((tenant: Tenant) => {
      handleSelectTenant(tenant);
      handleNavigate('configuration', 'Roles');
  }, [handleSelectTenant, handleNavigate]);

  const openMasterTenantModal = (tenant: Tenant | null) => {
    setEditingMasterTenant(tenant);
    setIsMasterTenantModalOpen(true);
  };


  if (!user) {
    return <LoginPage onLogin={handleLogin} users={users} />;
  }

  if (!selectedTenant) {
    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-100 dark:bg-brand-black text-slate-900 dark:text-white">
            <div className="text-center">
                <p className="text-lg">No tenant selected or available.</p>
                {user.role === 'super-admin' && (
                    <button 
                        onClick={() => setIsNewTenantModalOpen(true)}
                        className="mt-4 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-md"
                    >
                        Create Your First Tenant
                    </button>
                )}
            </div>
             <NewTenantModal
                isOpen={isNewTenantModalOpen}
                onClose={() => setIsNewTenantModalOpen(false)}
                onSave={handleCreateTenant}
                masterTenants={masterTenants}
                tenants={tenants}
                baseTemplates={baseTemplates}
            />
        </div>
    );
  }

  return (
    <>
    <div className={`h-screen w-screen ${isFullScreenPreview ? '' : 'grid grid-cols-[280px_1fr] grid-rows-[auto_1fr]'}`}>
       {!isFullScreenPreview && <Header 
          user={user} 
          onLogout={handleLogout}
          tenants={tenants}
          selectedTenant={selectedTenant}
          onSelectTenant={handleSelectTenant}
          onOpenNewTenantModal={() => setIsNewTenantModalOpen(true)}
          onOpenDeleteTenantModal={handleOpenDeleteTenantModal}
        />}
      {!isFullScreenPreview && <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />}
      <main className={isFullScreenPreview ? "h-full" : "col-start-2 bg-slate-100 dark:bg-brand-black flex flex-col overflow-hidden"}>
        <SubHeader 
            currentPage={currentPage} 
            activeConfigurationTab={activeConfigurationTab}
            onNavigate={handleNavigate}
        />
        <div className="flex-grow overflow-auto">
            {currentPage === 'dashboard' && <DashboardPage 
                user={user}
                tenant={selectedTenant}
                tenants={tenants}
                onEditCustomTemplate={handleEditCustomTemplate}
                onDeleteTenant={handleOpenDeleteTenantModal}
                theme={theme} 
            />}
            {currentPage === 'templates' && (
              <TemplateEditorPage
                key={selectedTenant.id}
                user={user}
                tenant={selectedTenant}
                tenants={tenants}
                baseTemplates={baseTemplates}
                onUpdateTemplate={handleUpdateTemplate}
                onSaveTemplate={handleSaveTemplate}
                onSaveAsBaseTemplate={handleSaveAsBaseTemplate}
                onDeleteBaseTemplate={handleDeleteBaseTemplate}
                onLoadTemplate={handleLoadTemplate}
                onDeleteCustomTemplate={handleDeleteCustomTemplate}
                isFullScreen={isFullScreenPreview}
                setIsFullScreen={setIsFullScreenPreview}
              />
            )}
             {currentPage === 'master-tenants' && user.role === 'super-admin' && (
                <MasterTenantsPage
                    tenants={tenants}
                    baseTemplates={baseTemplates}
                    onOpenModal={openMasterTenantModal}
                    onDelete={handleOpenDeleteTenantModal}
                    onConfigure={handleConfigureMasterTenant}
                />
            )}
            {currentPage === 'configuration' && (
                <ConfigurationPage
                  key={`${selectedTenant.id}-configuration`}
                  tenant={selectedTenant}
                  onUpdate={handleUpdateConfiguration}
                  activeTab={activeConfigurationTab}
                />
            )}
            {currentPage === 'users' && (
                <UsersPage
                    currentUser={user}
                    users={users}
                    tenants={tenants}
                    selectedTenant={selectedTenant}
                    onAddUser={handleAddUser}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                />
            )}
        </div>
      </main>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        tenant={selectedTenant}
      />
    </div>
    <NewTenantModal
        isOpen={isNewTenantModalOpen}
        onClose={() => setIsNewTenantModalOpen(false)}
        onSave={handleCreateTenant}
        masterTenants={masterTenants}
        tenants={tenants}
        baseTemplates={baseTemplates}
    />
     <MasterTenantModal
        isOpen={isMasterTenantModalOpen}
        onClose={() => { setIsMasterTenantModalOpen(false); setEditingMasterTenant(null); }}
        onSave={handleSaveMasterTenant}
        baseTemplates={baseTemplates}
        masterTenant={editingMasterTenant}
    />
    {tenantToDelete && (
      <DeleteTenantModal
          isOpen={isDeleteTenantModalOpen}
          onClose={() => setIsDeleteTenantModalOpen(false)}
          onConfirm={handleDeleteTenant}
          tenantName={tenantToDelete.name}
      />
    )}
    </>
  );
}