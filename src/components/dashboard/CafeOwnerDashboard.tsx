import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Coffee, 
  DollarSign, 
  ShoppingCart, 
  Users,
  QrCode,
  Plus,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const CafeOwnerDashboard = () => {
  const { user } = useAuth();
  
  // Mock data - replace with real API calls
  const stats = {
    todaySales: 1250,
    activeOrders: 8,
    totalMenuItems: 45,
    tablesWithQR: 12,
    monthlyRevenue: 18500,
    customerCount: 156
  };

  const recentOrders = [
    { id: "ORD001", table: 5, items: ["Cappuccino", "Croissant"], total: 12.50, status: "preparing", time: "2 min ago" },
    { id: "ORD002", table: 3, items: ["Americano", "Sandwich"], total: 15.00, status: "ready", time: "5 min ago" },
    { id: "ORD003", table: 8, items: ["Latte", "Muffin", "Juice"], total: 18.75, status: "completed", time: "12 min ago" },
    { id: "ORD004", table: 1, items: ["Espresso"], total: 4.50, status: "new", time: "just now" },
  ];

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-accent/10 text-accent border-accent/20">New</Badge>;
      case 'preparing':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Preparing</Badge>;
      case 'ready':
        return <Badge className="bg-success/10 text-success border-success/20">Ready</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="h-4 w-4 text-accent" />;
      case 'preparing':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-accent rounded-xl p-6 text-accent-foreground shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-accent-foreground/80">Here's what's happening at your cafe today</p>
          </div>
          {user?.subscription && (
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.subscription.status === 'active' ? 'bg-white/20 text-white' : 
                user.subscription.status === 'trial' ? 'bg-warning/20 text-warning-foreground' :
                'bg-destructive/20 text-destructive-foreground'
              }`}>
                {user.subscription.plan.charAt(0).toUpperCase() + user.subscription.plan.slice(1)} Plan
              </div>
              <p className="text-xs text-accent-foreground/70 mt-1">
                {user.subscription.status === 'trial' ? 'Trial expires' : 'Renews'} {new Date(user.subscription.expiresAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todaySales}</div>
            <p className="text-xs text-success flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders in progress
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMenuItems}</div>
            <p className="text-xs text-muted-foreground">
              Available items
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Tables</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tablesWithQR}</div>
            <p className="text-xs text-muted-foreground">
              Tables with QR codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Orders */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Orders</CardTitle>
              <CardDescription>
                Real-time orders from your customers
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All Orders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  {getOrderIcon(order.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">Table {order.table}</h4>
                      <span className="text-sm text-muted-foreground">({order.id})</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">${order.total}</div>
                    <p className="text-xs text-muted-foreground">{order.time}</p>
                  </div>
                  {getOrderStatusBadge(order.status)}
                  {order.status !== 'completed' && (
                    <Button size="sm" variant={order.status === 'new' ? 'accent' : 'success'}>
                      {order.status === 'new' ? 'Accept' : 
                       order.status === 'preparing' ? 'Ready' : 'Complete'}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center group-hover:text-accent transition-colors">
              <Plus className="h-5 w-5 mr-2" />
              Add Menu Item
            </CardTitle>
            <CardDescription>
              Create new food or drink items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="accent">
              Add Item
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center group-hover:text-accent transition-colors">
              <QrCode className="h-5 w-5 mr-2" />
              Generate QR
            </CardTitle>
            <CardDescription>
              Create QR codes for tables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center group-hover:text-accent transition-colors">
              <TrendingUp className="h-5 w-5 mr-2" />
              Analytics
            </CardTitle>
            <CardDescription>
              View detailed sales data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group">
          <CardHeader>
            <CardTitle className="flex items-center group-hover:text-accent transition-colors">
              <Coffee className="h-5 w-5 mr-2" />
              Menu
            </CardTitle>
            <CardDescription>
              Manage your full menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};