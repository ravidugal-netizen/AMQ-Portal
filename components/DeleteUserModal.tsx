import React from 'react';

interface DeleteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold">Delete User</h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Are you sure you want to permanently delete the user{' '}
                        <strong className="text-red-600 dark:text-red-400">{userName}</strong>?
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        This action cannot be undone.
                    </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                        Delete User
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;
