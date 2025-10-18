import React, { useState, useMemo } from 'react';
import type { User, Tenant } from '../types';
import { UsersIcon } from '../components/Icons';
import UserModal from '../components/UserModal';
import DeleteUserModal from '../components/DeleteUserModal';
import UserTable from '../components/UserTable';

interface UsersPageProps {
    currentUser: User;
    users: User[];
    tenants: Tenant[];
    selectedTenant: Tenant;
    onAddUser: (user: Omit<User, 'id' | 'status'>) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
}

const UsersPage: React.FC<UsersPageProps> = ({ currentUser, users, tenants, selectedTenant, onAddUser, onUpdateUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);

    const superAdmins = useMemo(() => users.filter(u => u.role === 'super-admin'), [users]);
    const tenantUsers = useMemo(() => {
        const tenantId = currentUser.role === 'super-admin' ? selectedTenant.id : currentUser.tenantId;
        return users.filter(user => user.tenantId === tenantId);
    }, [users, currentUser, selectedTenant]);

    const handleAddNew = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (user: User) => {
        setDeletingUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (deletingUser) {
            onDeleteUser(deletingUser.id);
            setIsDeleteModalOpen(false);
            setDeletingUser(null);
        }
    };
    
    const tenantMap = useMemo(() => new Map(tenants.map(t => [t.id, t.name])), [tenants]);

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">User Management</h2>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center space-x-2"
                >
                    <UsersIcon className="w-5 h-5" />
                    <span>Add User</span>
                </button>
            </div>

            {currentUser.role === 'super-admin' && (
                 <div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">Global Administrators</h3>
                     <UserTable
                        users={superAdmins}
                        currentUser={currentUser}
                        tenantMap={tenantMap}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            )}

            <div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">
                     {currentUser.role === 'super-admin' ? `Users for ${selectedTenant.name}` : 'Tenant Users'}
                </h3>
                 <UserTable
                    users={tenantUsers}
                    currentUser={currentUser}
                    tenantMap={tenantMap}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>


            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={editingUser ? onUpdateUser : onAddUser}
                user={editingUser}
                currentUser={currentUser}
                tenants={tenants}
            />
            
            {deletingUser && (
                <DeleteUserModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    userName={deletingUser.name}
                />
            )}
        </div>
    );
};

export default UsersPage;