import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Utensils,
  DollarSign,
  MapPin,
  User,
  RefreshCw
} from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { orderAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Order {
  _id: string;
  cafeId: string;
  orderNumber: string;
  customerId?: {
    name: string;
    email: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    customizations?: Array<{
      name: string;
      option: string;
      price: number;
    }>;
  }>;
  pricing: {
    totalAmount: number;
    subtotal: number;
  };
  status: 'pending' | 'confirmed' | 'in-progress' | 'ready' | 'completed' | 'cancelled';
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: number;
  notes?: string;
  createdAt: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
}

interface RealTimeOrderBoardProps {
  cafeId: string;
}

export const RealTimeOrderBoard: React.FC<RealTimeOrderBoardProps> = ({ cafeId }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { socket, joinCafeRoom } = useSocket();
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getOrders(cafeId, {
        status: filter === 'all' ? undefined : filter,
        limit: 50,
        sort: '-createdAt'
      });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cafeId) {
      fetchOrders();
      joinCafeRoom(cafeId);
    }
  }, [cafeId, filter]);

  useEffect(() => {
    if (socket) {
      // Listen for real-time order updates
      socket.on('order-created', (newOrder: Order) => {
        if (newOrder.cafeId === cafeId) {
          setOrders(prev => [newOrder, ...prev]);
          toast({
            title: "New Order",
            description: `Order ${newOrder.orderNumber} received`,
          });
        }
      });

      socket.on('order-updated', (updatedOrder: Order) => {
        if (updatedOrder.cafeId === cafeId) {
          setOrders(prev => 
            prev.map(order => 
              order._id === updatedOrder._id ? updatedOrder : order
            )
          );
        }
      });

      return () => {
        socket.off('order-created');
        socket.off('order-updated');
      };
    }
  }, [socket, cafeId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'confirmed':
        return 'bg-info/10 text-info border-info/20';
      case 'in-progress':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'ready':
        return 'bg-success/10 text-success border-success/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Play className="h-4 w-4" />;
      case 'ready':
        return <Utensils className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'in-progress',
      'in-progress': 'ready',
      'ready': 'completed'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'confirmed', 'in-progress', 'ready'].includes(order.status);
    return order.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Order Management</h2>
          <p className="text-muted-foreground">Real-time order tracking and management</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter orders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="active">Active Orders</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <Card key={order._id} className="shadow-medium hover:shadow-glow transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                    {order.tableNumber && (
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Table {order.tableNumber}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  {order.customerId && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{order.customerId.name}</span>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{item.quantity}x {item.name}</span>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.customizations.map((custom, i) => (
                                <span key={i} className="block">
                                  + {custom.name}: {custom.option}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Notes:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="flex items-center text-lg font-semibold">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Total: ${order.pricing.totalAmount.toFixed(2)}
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {order.orderType}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="flex space-x-2 pt-2">
                      {getNextStatus(order.status) && (
                        <Button
                          onClick={() => updateOrderStatus(order._id, getNextStatus(order.status))}
                          size="sm"
                          className="flex-1"
                        >
                          Mark as {getNextStatus(order.status).replace('-', ' ')}
                        </Button>
                      )}
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                          variant="destructive"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' ? 'No orders have been placed yet.' : `No ${filter} orders found.`}
              </p>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};