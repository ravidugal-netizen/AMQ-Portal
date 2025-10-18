import React, { useState, useEffect } from 'react';
import type { User, UserRole, Tenant } from '../types';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: any) => void;
    user: User | null;
    currentUser: User;
    tenants: Tenant[];
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSave, user, currentUser, tenants }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'tenant-user' as UserRole,
        tenantId: '',
        password: '',
        confirmPassword: ''
    });
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setError('');
            if (user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    tenantId: user.tenantId || '',
                    password: '',
                    confirmPassword: ''
                });
                setShowPasswordFields(false);
            } else {
                setFormData({
                    name: '',
                    email: '',
                    role: 'tenant-user',
                    tenantId: currentUser.role === 'tenant-admin' ? currentUser.tenantId! : '',
                    password: '',
                    confirmPassword: ''
                });
                setShowPasswordFields(true); // Always show for new users
            }
        }
    }, [user, isOpen, currentUser]);

    if (!isOpen) return null;

    const handleSave = () => {
        setError('');
        if (showPasswordFields) {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            if (!user && !formData.password) {
                setError("Password is required for new users.");
                return;
            }
            if (formData.password && formData.password.length < 6) {
                setError("Password must be at least 6 characters long.");
                return;
            }
        }
        
        const { confirmPassword, ...data } = formData;
        const payload: any = {
            name: data.name,
            email: data.email,
            role: data.role,
        };

        if (data.role !== 'super-admin') {
            payload.tenantId = data.tenantId;
        }

        if (showPasswordFields && data.password) {
            payload.password = data.password;
        }

        const finalData = user ? { ...user, ...payload } : payload;
        onSave(finalData);
        onClose();
    };

    const availableRoles = () => {
        if (currentUser.role === 'super-admin') {
            return ['super-admin', 'tenant-admin', 'tenant-user'];
        }
        if (currentUser.role === 'tenant-admin') {
            return ['tenant-admin', 'tenant-user'];
        }
        return [];
    };

    const isTenantRequired = formData.role === 'tenant-admin' || formData.role === 'tenant-user';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg shadow-2xl w-full max-w-md">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold">{user ? 'Edit User' : 'Add New User'}</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole, tenantId: e.target.value === 'super-admin' ? '' : formData.tenantId })} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-900 dark:text-white">
                            {availableRoles().map(role => (
                                <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')}</option>
                            ))}
                        </select>
                    </div>
                    {isTenantRequired && currentUser.role === 'super-admin' && (
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tenant</label>
                            <select value={formData.tenantId} onChange={e => setFormData({ ...formData, tenantId: e.target.value })} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-900 dark:text-white">
                                <option value="">Select a Tenant</option>
                                {tenants.map(tenant => (
                                    <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                     <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                        {user && !showPasswordFields && (
                            <button onClick={() => setShowPasswordFields(true)} className="w-full text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                                Set New Password
                            </button>
                        )}
                        {showPasswordFields && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{user ? 'New Password' : 'Password'}</label>
                                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-900 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                                    <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md px-3 py-2 text-slate-900 dark:text-white" />
                                </div>
                            </>
                        )}
                     </div>
                    {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 flex justify-end space-x-2 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 rounded-md bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Save</button>
                </div>
            </div>
        </div>
    );
};

export default UserModal;