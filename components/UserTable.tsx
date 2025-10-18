import React from 'react';
import type { User } from '../types';
import { EditIcon, TrashIcon } from './Icons';

interface UserTableProps {
    users: User[];
    currentUser: User;
    tenantMap: Map<string, string>;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
}

const roleStyles: Record<User['role'], { bg: string; text: string }> = {
    'super-admin': { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-300' },
    'tenant-admin': { bg: 'bg-pink-100 dark:bg-pink-900/50', text: 'text-pink-600 dark:text-pink-400' },
    'tenant-user': { bg: 'bg-slate-200 dark:bg-brand-dark', text: 'text-slate-600 dark:text-slate-300' },
};

const statusStyles: Record<User['status'], { bg: string; text: string }> = {
    'Active': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-300' },
    'Pending': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-400' },
};


const UserTable: React.FC<UserTableProps> = ({ users, currentUser, tenantMap, onEdit, onDelete }) => {
    if (users.length === 0) {
        return <p className="text-center text-slate-500 dark:text-slate-400 py-4">No users to display.</p>;
    }

    return (
        <div className="bg-white dark:bg-brand-surface shadow-lg rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-brand-dark">
                <thead className="bg-slate-50 dark:bg-black/20">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                        {currentUser.role === 'super-admin' && <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tenant</th>}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-brand-dark">
                    {users.map(user => {
                        const roleStyle = roleStyles[user.role];
                        const statusStyle = statusStyles[user.status];
                        return (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-black/10">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyle.bg} ${roleStyle.text}`}>
                                        {user.role.replace('-', ' ')}
                                    </span>
                                </td>
                                {currentUser.role === 'super-admin' && (
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {user.tenantId ? tenantMap.get(user.tenantId) : 'N/A'}
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                        {user.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        {user.status === 'Pending' && <button className="text-brand-primary hover:text-brand-primary-hover">Resend Invite</button>}
                                        <button onClick={() => onEdit(user)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-full"><EditIcon className="w-5 h-5"/></button>
                                        {user.id !== currentUser.id && (
                                            <button onClick={() => onDelete(user)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;