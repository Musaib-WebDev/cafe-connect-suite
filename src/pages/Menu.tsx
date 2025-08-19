import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Coffee, 
  Plus, 
  ShoppingCart, 
  Home, 
  Menu as MenuIcon,
  Grid3X3,
  Printer,
  ArrowLeft,
  Minus,
  Trash2,
  Tag,
  Bell,
  Croissant,
  Cake
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function Menu() {
  const { cafeId } = useParams();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  
  // Mock data - replace with real API
  const customerName = "Ghazaleh";
  const menuItems: MenuItem[] = [
    { id: '1', name: 'Latte Macchiato', price: 2.59, category: 'hot', available: true },
    { id: '2', name: 'Iced Mocha', price: 2.79, category: 'cold', available: true },
    { id: '3', name: 'Cappuccino', price: 3.45, category: 'hot', available: true },
    { id: '4', name: 'Lotus Latte', price: 3.79, category: 'hot', available: true },
    { id: '5', name: 'Iced Latte Frappe', price: 2.50, category: 'cold', available: true },
    { id: '6', name: 'Croissant', price: 1.99, category: 'breakfast', available: true },
    { id: '7', name: 'Blueberry Muffin', price: 2.29, category: 'muffin', available: true },
    { id: '8', name: 'Americano', price: 2.19, category: 'hot', available: true },
    { id: '9', name: 'Frappuccino', price: 4.50, category: 'cold', available: true },
    { id: '10', name: 'Chocolate Chip Cookie', price: 1.79, category: 'muffin', available: true },
  ];

  const categories = [
    { id: 'all', name: 'All', icon: Grid3X3 },
    { id: 'hot', name: 'Hot drink', icon: Coffee },
    { id: 'cold', name: 'Cold drink', icon: Coffee },
    { id: 'breakfast', name: 'Breakfast', icon: Croissant },
    { id: 'muffin', name: 'Muffin', icon: Cake },
  ];

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== id));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 1.00;
  const discount = promoCode === 'FREE10' ? subtotal * 0.1 : 0;
  const total = subtotal + deliveryFee - discount;

  const applyPromoCode = () => {
    if (promoCode === 'FREE10') {
      toast({
        title: "Promo Applied!",
        description: "10% discount applied to your order.",
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid promo code.",
        variant: "destructive",
      });
    }
  };

  const checkout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Order Placed!",
      description: "Your order has been sent to the kitchen.",
    });
    setCart([]);
    setShowCart(false);
  };

  if (showCart) {
    return (
      <div className="min-h-screen bg-background">
        {/* Cart Header */}
        <div className="bg-background border-b px-4 py-4 flex items-center justify-between sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCart(false)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Shopping Cart</h1>
          <div className="w-9" />
        </div>

        <div className="p-4 space-y-6 pb-24">
          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-muted/30 p-4 rounded-lg">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Coffee className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.quantity}x {item.name}</h3>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1 mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <>
              {/* Add More Items */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowCart(false)}
              >
                Add More Items
              </Button>

              {/* Discount Coupon */}
              <div className="space-y-3">
                <h3 className="font-medium">Discount Coupon</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={applyPromoCode} className="bg-success hover:bg-success/90 text-white">
                    Apply
                  </Button>
                </div>
              </div>

              {/* Order Total */}
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Sub total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery fees</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                <Button
                  onClick={checkout}
                  className="w-full bg-success hover:bg-success/90 text-white py-3"
                  size="lg"
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="p-4 space-y-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCart(true)}
            className="relative p-2"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs p-0 flex items-center justify-center bg-accent">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
            )}
          </Button>
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold">{getGreeting()}, {customerName}</h1>
          <p className="text-muted-foreground">It's time for coffee break</p>
        </div>

        {/* Promotional Banner */}
        <Card className="bg-gradient-to-r from-success/20 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-success text-lg">Buy 2</h3>
                <p className="text-sm text-success">Get a Free Cookie !</p>
                <Button size="sm" className="mt-2 bg-success hover:bg-success/90 text-white">
                  order now
                </Button>
              </div>
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <Coffee className="h-8 w-8 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Category</h3>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="flex flex-col items-center p-4 h-auto space-y-2"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <IconComponent className="h-6 w-6" />
                  <span className="text-xs">{category.name}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="px-4 pb-20">
        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden shadow-soft hover:shadow-medium transition-all">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-subtle flex items-center justify-center">
                  <Coffee className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-medium text-sm leading-tight">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      className="h-8 w-8 rounded-full p-0 bg-success hover:bg-success/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="grid grid-cols-4 h-16">
          <Button variant="ghost" className="flex flex-col items-center justify-center space-y-1 h-full">
            <Home className="h-5 w-5 text-success" />
            <span className="text-xs text-success">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center space-y-1 h-full">
            <Printer className="h-5 w-5" />
            <span className="text-xs">Print</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center space-y-1 h-full">
            <MenuIcon className="h-5 w-5" />
            <span className="text-xs">Menu</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center justify-center space-y-1 h-full">
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </div>
    </div>
  );
}