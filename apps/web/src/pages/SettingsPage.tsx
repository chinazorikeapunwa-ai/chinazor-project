import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { logout as logoutAPI } from '../services/api';
import { Button } from '../components/Button';

export function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await logoutAPI();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      
      <Button
        variant="danger"
        onClick={handleLogout}
        className="w-full"
      >
        Log Out
      </Button>
    </div>
  );
}
