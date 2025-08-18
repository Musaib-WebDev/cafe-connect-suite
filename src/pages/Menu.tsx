import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Coffee, 
  Plus, 
  Minus, 
  ShoppingCart,
  Star,
  Clock,
  Utensils,
  Cookie,
  Sandwich
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isAvailable: boolean;
  rating: number;
  prepTime: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function Menu() {
  const { cafeId } = useParams();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('table');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('coffee');
  const { toast } = useToast();

  // Mock menu data - replace with real API call
  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Classic Cappuccino',
      description: 'Rich espresso with steamed milk and foam',
      price: 4.50,
      category: 'coffee',
      isAvailable: true,
      rating: 4.8,
      prepTime: '3-5 min'
    },
    {
      id: '2',
      name: 'Americano',
      description: 'Pure espresso with hot water',
      price: 3.50,
      category: 'coffee',
      isAvailable: true,
      rating: 4.6,
      prepTime: '2-3 min'
    },
    {
      id: '3',
      name: 'Croissant',
      description: 'Buttery, flaky pastry - freshly baked',
      price: 3.00,
      category: 'pastries',
      isAvailable: true,
      rating: 4.9,
      prepTime: '1 min'
    },
    {
      id: '4',
      name: 'Club Sandwich',
      description: 'Triple-layer sandwich with turkey, bacon, lettuce and tomato',
      price: 12.50,
      category: 'food',
      isAvailable: true,
      rating: 4.7,
      prepTime: '8-10 min'
    },
    {
      id: '5',
      name: 'Chocolate Muffin',
      description: 'Rich chocolate chip muffin with chocolate glaze',
      price: 4.00,
      category: 'pastries',
      isAvailable: false,
      rating: 4.5,
      prepTime: '1 min'
    }
  ];

  const categories = [
    { id: 'coffee', name: 'Coffee', icon: Coffee },
    { id: 'food', name: 'Food', icon: Utensils },
    { id: 'pastries', name: 'Pastries', icon: Cookie }
  ];

  const filteredItems = menuItems.filter(item => item.category === activeCategory);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const addToCart = (item: MenuItem) => {
    if (!item.isAvailable) {
      toast({
        title: "Item Unavailable",
        description: "This item is currently not available.",
        variant: "destructive",
      });
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
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

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getItemQuantity = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const placeOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      });
      return;
    }

    // Mock order placement
    toast({
      title: "Order Placed!",
      description: `Your order for Table ${tableId} has been sent to the kitchen.`,
    });
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground p-6 shadow-medium">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Brew & Bytes Cafe</h1>
              <p className="text-primary-foreground/80">Table {tableId || '?'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/80">Scan to order</p>
              <p className="text-xs text-primary-foreground/60">No app required</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu */}
          <div className="flex-1">
            {/* Categories */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "accent" : "outline"}
                    onClick={() => setActiveCategory(category.id)}
                    className="flex-shrink-0"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                );
              })}
            </div>

            {/* Menu Items */}
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const quantity = getItemQuantity(item.id);
                return (
                  <Card key={item.id} className={`shadow-soft hover:shadow-medium transition-all duration-300 ${!item.isAvailable ? 'opacity-60' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            {!item.isAvailable && (
                              <Badge variant="destructive">Unavailable</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{item.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-accent mr-1" />
                              {item.rating}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {item.prepTime}
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold mb-2">${item.price}</div>
                          {quantity > 0 ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-medium w-8 text-center">{quantity}</span>
                              <Button
                                size="sm"
                                variant="accent"
                                onClick={() => addToCart(item)}
                                disabled={!item.isAvailable}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="accent"
                              onClick={() => addToCart(item)}
                              disabled={!item.isAvailable}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:w-96">
            <Card className="sticky top-4 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Your Order
                  {cartItemCount > 0 && (
                    <Badge className="ml-2 bg-accent/10 text-accent">
                      {cartItemCount}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Table {tableId || '?'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Your cart is empty
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${item.price} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-semibold text-lg">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full" 
                      variant="hero" 
                      size="lg"
                      onClick={placeOrder}
                    >
                      Place Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}