import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './button';
import { useApp } from '../../contexts/AppContext';

export function Header() {
  const { user, logout } = useApp();

  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/">
          <h1 className="text-xl font-bold">Event Platform</h1>
        </Link>
        <nav>
          {user ? (
            <div className="flex items-center gap-4">
              <span>Welcome, {user.username}</span>
              {user.role !== 'student' && (
                <Link to="/admin">
                  <Button variant="outline">Admin Dashboard</Button>
                </Link>
              )}
              <Button onClick={logout}>Logout</Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}