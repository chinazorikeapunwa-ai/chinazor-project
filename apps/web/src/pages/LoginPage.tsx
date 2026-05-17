import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { loginSuccess, loginFailure } from '../store/authSlice';
import { Button } from '../components/Button';
import { Input } from '../components/FormInputs';
import { Card } from '../components/Card';

export function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { accessToken, user } = await login(email, password);
      dispatch(loginSuccess({ user, accessToken }));
      navigate(user.role === 'rep' ? '/dashboard' : '/manager');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Login failed';
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Field Sales</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="rep1@fieldsales.com"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-3">Demo Accounts:</p>
          <div className="space-y-2 text-xs text-slate-500">
            <p>📱 <strong>Rep:</strong> rep1@fieldsales.com / rep123</p>
            <p>👔 <strong>Manager:</strong> manager@fieldsales.com / manager123</p>
            <p>🔐 <strong>Admin:</strong> admin@fieldsales.com / admin123</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
