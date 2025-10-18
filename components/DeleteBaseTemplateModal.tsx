import React from 'react';

interface DeleteBaseTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    templateName: string;
}

const DeleteBaseTemplateModal: React.FC<DeleteBaseTemplateModalProps> = ({ isOpen, onClose, onConfirm, templateName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-brand-surface text-slate-800 dark:text-slate-200 rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold">Delete Base Template</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Are you sure you want to permanently delete the base template{' '}
                        <strong className="text-red-600 dark:text-red-400">{templateName}</strong>?
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        This action cannot be undone and will remove it as an option for all tenants.
                    </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-black/20 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-white dark:bg-brand-dark border border-slate-300 dark:border-brand-dark text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark/80">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteBaseTemplateModal;