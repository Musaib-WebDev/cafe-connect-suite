import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Coffee, 
  DollarSign, 
  TrendingUp, 
  Store,
  Calendar,
  Settings,
  Eye,
  Ban,
  CheckCircle
} from 'lucide-react';

export const SuperAdminDashboard = () => {
  // Mock data - replace with real API calls
  const stats = {
    totalCafes: 127,
    activeCafes: 89,
    totalRevenue: 45670,
    monthlyGrowth: 12.5,
    activeSubscriptions: 89,
    trialAccounts: 23
  };

  const recentCafes = [
    { id: 1, name: "Brew & Bytes", owner: "john@brewbytes.com", status: "active", plan: "premium", joinedAt: "2024-01-15" },
    { id: 2, name: "Coffee Corner", owner: "sarah@corner.com", status: "trial", plan: "basic", joinedAt: "2024-01-14" },
    { id: 3, name: "Urban Grind", owner: "mike@urban.com", status: "active", plan: "enterprise", joinedAt: "2024-01-13" },
    { id: 4, name: "The Daily Bean", owner: "lisa@daily.com", status: "suspended", plan: "premium", joinedAt: "2024-01-12" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success border-success/20">Active</Badge>;
      case 'trial':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Trial</Badge>;
      case 'suspended':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Badge className="bg-accent/10 text-accent border-accent/20">Enterprise</Badge>;
      case 'premium':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Premium</Badge>;
      case 'basic':
        return <Badge variant="outline">Basic</Badge>;
      default:
        return <Badge variant="secondary">{plan}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground shadow-glow">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-primary-foreground/80">Manage all cafes, subscriptions, and platform analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cafes</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCafes}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCafes} active cafes
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-success flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.trialAccounts} trial accounts
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.monthlyGrowth}%</div>
            <p className="text-xs text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cafes */}
      <Card className="shadow-medium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Cafe Registrations</CardTitle>
              <CardDescription>
                Latest cafes that joined the platform
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentCafes.map((cafe) => (
              <div key={cafe.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-primary p-2 rounded-lg">
                    <Coffee className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{cafe.name}</h4>
                    <p className="text-sm text-muted-foreground">{cafe.owner}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(cafe.status)}
                      {getPlanBadge(cafe.plan)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {new Date(cafe.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    {cafe.status === 'active' && (
                      <Button variant="ghost" size="sm">
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Manage Cafes
            </CardTitle>
            <CardDescription>
              View, approve, or suspend cafe accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="accent">
              Go to Cafe Management
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Subscription Plans
            </CardTitle>
            <CardDescription>
              Configure pricing and plan features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              Manage Plans
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Analytics
            </CardTitle>
            <CardDescription>
              View detailed platform analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline">
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};