import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { Button, Input } from '../ui';
import { verifyEmail } from '../../services/authService';
import { User } from '../../types';

interface EmailVerificationProps {
    onSuccess: (user: User) => void;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({ onSuccess }) => {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const user = await verifyEmail(code);
            onSuccess(user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-6">
                    <Mail size={32} className="text-blue-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-800 mb-2">Check your email</h2>
                <p className="text-slate-500 mb-8">
                    We've sent a 6-digit verification code to your email address.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Verification Code"
                        value={code}
                        onChange={(e: any) => setCode(e.target.value)}
                        placeholder="123456"
                        className="text-center text-2xl tracking-widest"
                    />

                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    <Button className="w-full" isLoading={isLoading}>
                        Verify & Activate Trial <ArrowRight size={16} className="ml-2" />
                    </Button>
                </form>

                <p className="mt-6 text-sm text-slate-400">
                    Use code <strong>123456</strong> for demo purposes.
                </p>
            </div>
        </div>
    );
};

export default EmailVerification;
