import React from 'react';
import type { Theme, Tenant } from '../types';
import { SunIcon, MoonIcon } from './Icons';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    tenant: Tenant;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, theme, setTheme, tenant }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-brand-surface text-slate-900 dark:text-slate-200 rounded-lg shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-200 dark:border-brand-dark">
                    <h2 className="text-xl font-bold">Settings</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Manage your portal preferences and view tenant details.</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold">Appearance</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Choose a light or dark theme.</p>
                        </div>
                        <div className="flex items-center bg-slate-200 dark:bg-brand-dark rounded-full p-1">
                            <button
                                onClick={() => setTheme('light')}
                                className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-white shadow' : 'hover:bg-slate-300 dark:hover:bg-brand-dark/80'}`}
                                aria-label="Switch to light theme"
                            >
                                <SunIcon className={`w-5 h-5 ${theme === 'light' ? 'text-yellow-500' : 'text-slate-500'}`} />
                            </button>
                             <button
                                onClick={() => setTheme('dark')}
                                className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-black shadow' : 'hover:bg-slate-300 dark:hover:bg-brand-dark/80'}`}
                                aria-label="Switch to dark theme"
                            >
                                <MoonIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-brand-primary' : 'text-slate-500'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 dark:border-brand-dark pt-4">
                        <h3 className="font-semibold">Tenant Information</h3>
                        <div className="mt-2 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Tenant Name:</span>
                                <span className="font-medium">{tenant.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Expiry Date:</span>
                                <span className="font-medium">{new Date(tenant.expiryDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Max Users:</span>
                                <span className="font-medium">{tenant.maxUserCount}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/20 flex justify-end rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary-hover">Done</button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;