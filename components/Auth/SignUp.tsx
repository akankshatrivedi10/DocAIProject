import React, { useState } from 'react';
import { Mail, Lock, Building, User, ArrowRight } from 'lucide-react';
import { Button, Input } from '../ui';
import { register } from '../../services/authService';

interface SignUpProps {
    onNavigate: (view: 'LOGIN' | 'VERIFY') => void;
}

const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
    const [formData, setFormData] = useState({ name: '', email: '', company: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await register(formData.name, formData.email, formData.company);
            onNavigate('VERIFY');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-blue-200">
                        DB
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Start your free trial</h2>
                    <p className="text-slate-500 mt-2">No credit card required.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        icon={<User size={16} />}
                    />
                    <Input
                        label="Work Email"
                        type="email"
                        value={formData.email}
                        onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                        icon={<Mail size={16} />}
                    />
                    <Input
                        label="Company Name"
                        value={formData.company}
                        onChange={(e: any) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Acme Inc."
                        icon={<Building size={16} />}
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e: any) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        icon={<Lock size={16} />}
                    />

                    <Button className="w-full mt-6" isLoading={isLoading}>
                        Create Account <ArrowRight size={16} className="ml-2" />
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <button onClick={() => onNavigate('LOGIN')} className="text-blue-600 font-medium hover:underline">
                        Sign in
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
