import React, { useState } from 'react';

interface SaveBaseTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
}

const SaveBaseTemplateModal: React.FC<SaveBaseTemplateModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            setName('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">Save as Base Template</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Save the current design as a new base template available to all tenants.</p>
                </div>
                <div className="p-6">
                    <label htmlFor="templateName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base Template Name</label>
                    <input
                        id="templateName"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Global Corporate Style"
                        className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400 dark:disabled:bg-slate-600">Save Base Template</button>
                </div>
            </div>
        </div>
    );
};

export default SaveBaseTemplateModal;
