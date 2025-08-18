import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { QRCodeGenerator } from '@/components/dashboard/QRCodeGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Store, 
  Palette, 
  QrCode, 
  Bell,
  Shield,
  CreditCard,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CafeSettings() {
  const { toast } = useToast();
  const [cafeSettings, setCafeSettings] = useState({
    name: 'Demo Cafe',
    description: 'A cozy place for coffee lovers',
    address: '123 Coffee Street, Brew City',
    phone: '+1 (555) 123-4567',
    email: 'hello@democafe.com',
    theme: 'default',
    notifications: {
      newOrders: true,
      lowStock: true,
      marketing: false
    },
    orderSettings: {
      autoAccept: false,
      estimatedTime: 15,
      minimumOrder: 5.00
    }
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your cafe settings have been updated successfully.",
    });
  };

  const updateSetting = (path: string, value: any) => {
    setCafeSettings(prev => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mobile-container py-6">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Cafe Settings</h1>
          <p className="text-muted-foreground">Manage your cafe profile, themes, and preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
            <TabsTrigger value="general" className="text-xs lg:text-sm">
              <Store className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="text-xs lg:text-sm">
              <Palette className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="qr-codes" className="text-xs lg:text-sm">
              <QrCode className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">QR Codes</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs lg:text-sm">
              <Bell className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs lg:text-sm">
              <Settings className="h-4 w-4 mr-1 lg:mr-2" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Store className="h-5 w-5 mr-2" />
                  Cafe Information
                </CardTitle>
                <CardDescription>
                  Update your cafe's basic information that customers will see
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cafe-name">Cafe Name</Label>
                    <Input
                      id="cafe-name"
                      value={cafeSettings.name}
                      onChange={(e) => updateSetting('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cafe-phone">Phone Number</Label>
                    <Input
                      id="cafe-phone"
                      value={cafeSettings.phone}
                      onChange={(e) => updateSetting('phone', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cafe-description">Description</Label>
                  <Textarea
                    id="cafe-description"
                    value={cafeSettings.description}
                    onChange={(e) => updateSetting('description', e.target.value)}
                    placeholder="Tell customers about your cafe..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="cafe-address">Address</Label>
                  <Input
                    id="cafe-address"
                    value={cafeSettings.address}
                    onChange={(e) => updateSetting('address', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="cafe-email">Contact Email</Label>
                  <Input
                    id="cafe-email"
                    type="email"
                    value={cafeSettings.email}
                    onChange={(e) => updateSetting('email', e.target.value)}
                  />
                </div>

                <Button onClick={handleSave} className="w-full lg:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-6">
            <ThemeSelector
              currentTheme={cafeSettings.theme}
              onThemeChange={(theme) => updateSetting('theme', theme)}
            />
          </TabsContent>

          <TabsContent value="qr-codes" className="space-y-6">
            <QRCodeGenerator />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">New Orders</h4>
                    <p className="text-sm text-muted-foreground">Get notified when customers place new orders</p>
                  </div>
                  <Switch
                    checked={cafeSettings.notifications.newOrders}
                    onCheckedChange={(checked) => updateSetting('notifications.newOrders', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Low Stock Alerts</h4>
                    <p className="text-sm text-muted-foreground">Receive alerts when menu items are running low</p>
                  </div>
                  <Switch
                    checked={cafeSettings.notifications.lowStock}
                    onCheckedChange={(checked) => updateSetting('notifications.lowStock', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Updates</h4>
                    <p className="text-sm text-muted-foreground">Platform updates and promotional tips</p>
                  </div>
                  <Switch
                    checked={cafeSettings.notifications.marketing}
                    onCheckedChange={(checked) => updateSetting('notifications.marketing', checked)}
                  />
                </div>

                <Button onClick={handleSave} className="w-full lg:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Order Management
                </CardTitle>
                <CardDescription>
                  Configure how orders are handled in your cafe
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-Accept Orders</h4>
                    <p className="text-sm text-muted-foreground">Automatically accept incoming orders</p>
                  </div>
                  <Switch
                    checked={cafeSettings.orderSettings.autoAccept}
                    onCheckedChange={(checked) => updateSetting('orderSettings.autoAccept', checked)}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimated-time">Default Preparation Time (minutes)</Label>
                    <Input
                      id="estimated-time"
                      type="number"
                      value={cafeSettings.orderSettings.estimatedTime}
                      onChange={(e) => updateSetting('orderSettings.estimatedTime', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="minimum-order">Minimum Order Amount ($)</Label>
                    <Input
                      id="minimum-order"
                      type="number"
                      step="0.01"
                      value={cafeSettings.orderSettings.minimumOrder}
                      onChange={(e) => updateSetting('orderSettings.minimumOrder', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <Button onClick={handleSave} className="w-full lg:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Update Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}