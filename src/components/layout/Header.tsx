import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  User,
  LogOut,
  Settings,
  ShoppingCart,
  Coffee,
  Home,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  Globe,
} from 'lucide-react';

const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { state: authState, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const itemCount = getItemCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">CafeManager</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary"
            >
              <Home className="h-4 w-4" />
              <span>{t('home')}</span>
            </Link>
            <Link
              to="/cafes"
              className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary"
            >
              <Coffee className="h-4 w-4" />
              <span>{t('cafes')}</span>
            </Link>
            {authState.user && (
              <>
                {authState.user.role === 'customer' && (
                  <>
                    <Link
                      to="/orders"
                      className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary"
                    >
                      <ClipboardList className="h-4 w-4" />
                      <span>{t('orders')}</span>
                    </Link>
                    <Link
                      to="/reservations"
                      className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>{t('reservations')}</span>
                    </Link>
                  </>
                )}
                {authState.user.role === 'cafeowner' && (
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{t('dashboard')}</span>
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Globe className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('es')}>
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cart */}
            {authState.user?.role === 'customer' && (
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            )}

            {/* User Menu */}
            {authState.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={authState.user.avatar} alt={authState.user.name} />
                      <AvatarFallback>
                        {authState.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{authState.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {authState.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  {t('login')}
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  {t('register')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;