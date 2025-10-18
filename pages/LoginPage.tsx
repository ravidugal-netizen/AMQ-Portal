import React, { useState } from 'react';
import type { User } from '../types';
import { AnswerMyQIcon } from '../components/Icons';

interface LoginPageProps {
    onLogin: (user: User) => void;
    users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, users }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'Active');

        if (user && user.password === password) {
            onLogin(user);
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-brand-black p-4">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-brand-surface rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center">
                    <AnswerMyQIcon />
                    <h2 className="mt-6 text-3xl font-extrabold text-center text-slate-900 dark:text-white">
                        Sign in to your account
                    </h2>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Email address
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-brand-dark rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-brand-dark text-slate-900 dark:text-white"
                                placeholder="super@admin.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Password
                        </label>
                        <div className="mt-1">
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-brand-dark rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary bg-white dark:bg-brand-dark text-slate-900 dark:text-white"
                                placeholder="password"
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;