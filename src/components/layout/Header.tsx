import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Coffee, Settings, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'super_admin':
        return <Crown className="h-4 w-4 text-accent" />;
      case 'cafe_owner':
        return <Coffee className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'super_admin':
        return 'Super Admin';
      case 'cafe_owner':
        return 'Cafe Owner';
      default:
        return 'User';
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-primary p-2 rounded-lg group-hover:shadow-glow transition-all duration-300">
              <Coffee className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CafeFlow</h1>
              <p className="text-xs text-muted-foreground">SaaS Management</p>
            </div>
          </Link>

          {/* User Info & Actions */}
          {user && (
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-lg">
                {getRoleIcon()}
                <div className="text-sm">
                  <p className="font-medium text-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
                </div>
              </div>

              {/* Subscription Status */}
              {user.subscription && (
                <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                  user.subscription.status === 'active' ? 'bg-success/10 text-success' :
                  user.subscription.status === 'trial' ? 'bg-warning/10 text-warning' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {user.subscription.status === 'active' ? 'Premium' : 
                   user.subscription.status === 'trial' ? 'Trial' : 'Inactive'}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};