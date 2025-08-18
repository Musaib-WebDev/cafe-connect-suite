import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Coffee, 
  Users, 
  QrCode, 
  TrendingUp, 
  Crown,
  Store,
  Smartphone,
  CheckCircle,
  ArrowRight,
  Star
} from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Users,
      title: "Multi-Tenant Architecture",
      description: "Separate dashboards for super admins and cafe owners with role-based access control."
    },
    {
      icon: QrCode,
      title: "QR Code Ordering",
      description: "Customers scan table QR codes to access menus and place orders instantly."
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track sales, monitor orders, and analyze performance with detailed insights."
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Optimized for all devices with a responsive, intuitive interface."
    }
  ];

  const plans = [
    {
      name: "Basic",
      price: "$29",
      period: "/month",
      features: ["Up to 5 tables", "Basic analytics", "QR code generation", "Email support"],
      popular: false
    },
    {
      name: "Premium",
      price: "$79",
      period: "/month",
      features: ["Unlimited tables", "Advanced analytics", "Custom branding", "Priority support", "Multi-location"],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: ["White-label solution", "API access", "Custom integrations", "Dedicated support", "SLA guarantee"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-lg shadow-glow">
                <Coffee className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">CafeFlow</h1>
                <p className="text-xs text-muted-foreground">SaaS Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button variant="hero">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-8">
            <Badge className="bg-accent/10 text-accent border-accent/20 mb-4">
              SaaS Platform for Cafes
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Revolutionize Your
              <span className="bg-gradient-accent bg-clip-text text-transparent"> Cafe Business</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Complete SaaS solution for cafe management with QR code ordering, real-time analytics, 
              and multi-tenant architecture. Perfect for cafe owners and SaaS entrepreneurs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Link to="/register">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/menu/demo?table=1">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                View Demo Menu
                <QrCode className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Demo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="shadow-medium hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <Crown className="h-8 w-8 text-accent mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Super Admin</CardTitle>
                <CardDescription>Platform management and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/login">
                  <Button variant="accent" className="w-full">
                    Demo Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <Store className="h-8 w-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Cafe Owner</CardTitle>
                <CardDescription>Manage menu, orders, and QR codes</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/login">
                  <Button variant="hero" className="w-full">
                    Demo Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-medium hover:shadow-glow transition-all duration-300 group">
              <CardHeader>
                <Smartphone className="h-8 w-8 text-success mb-2 group-hover:scale-110 transition-transform" />
                <CardTitle>Customer View</CardTitle>
                <CardDescription>QR code menu and ordering</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/menu/demo?table=5">
                  <Button variant="success" className="w-full">
                    Demo Menu
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built specifically for cafe businesses with modern SaaS architecture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="shadow-soft hover:shadow-medium transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-accent p-3 rounded-lg group-hover:shadow-glow transition-all">
                        <Icon className="h-6 w-6 text-accent-foreground" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the perfect plan for your cafe business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`shadow-medium hover:shadow-glow transition-all duration-300 relative ${
                plan.popular ? 'border-accent shadow-accent/20' : ''
              }`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-accent text-accent-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-4xl font-bold text-foreground">
                    {plan.price}
                    <span className="text-lg text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "hero" : "outline"}
                    size="lg"
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Coffee className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">CafeFlow</h3>
                <p className="text-xs text-muted-foreground">SaaS Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2024 CafeFlow. All rights reserved.</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-accent" />
                <span>Production Ready</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
