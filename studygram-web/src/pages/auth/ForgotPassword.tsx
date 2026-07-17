import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../utils/apiClient';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
      if (response.data && response.data.resetToken) {
        setResetToken(response.data.resetToken);
      }
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
          Forgot Password?
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter your email to receive a password reset link.
        </p>
      </div>

      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
          {error}
        </div>
      )}

      {sent ? (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Reset Link Sent!
          </p>
          <p className="text-xs text-slate-500">
            We have sent a password recovery code/link to <strong>{email}</strong>.
          </p>
          {resetToken && (
            <div className="p-3 bg-slate-100 dark:bg-slate-850 rounded-lg text-xs font-mono text-indigo-600 dark:text-indigo-400 break-all">
              Reset Token (Dev Mode): {resetToken}
            </div>
          )}
          <div className="mt-4">
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="text-xs font-semibold text-indigo-600 hover:underline block mb-3"
            >
              Proceed to Reset Password Page
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                placeholder="e.g. rohit@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-75 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Send Reset Link'
            )}
          </button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-500 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </form>
      )}
    </div>
  );
};
