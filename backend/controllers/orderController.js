import Order from '../models/Order.js';
import Menu from '../models/Menu.js';
import Cafe from '../models/Cafe.js';
import Inventory from '../models/Inventory.js';
import Promotion from '../models/Promotion.js';
// import OneSignal from 'onesignal-node'; // Uncomment when OneSignal is configured

// @desc    Get all orders for a cafe
// @route   GET /api/cafes/:cafeId/orders
// @access  Private (Cafe Owner)
export const getOrders = async (req, res) => {
  try {
    const { status, date, orderType, page = 1, limit = 10 } = req.query;
    
    let query = { cafeId: req.params.cafeId };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = { $gte: startDate, $lt: endDate };
    }
    
    if (orderType) {
      query.orderType = orderType;
    }

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('items.menuId', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('items.menuId', 'name price description')
      .populate('cafeId', 'name address contact');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role === 'customer' && order.customerId?.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    if (req.user.role === 'cafeowner') {
      const cafe = await Cafe.findById(order.cafeId);
      if (cafe.ownerId.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized to view this order'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const {
      cafeId,
      items,
      customerInfo,
      orderType = 'dine-in',
      tableNumber,
      deliveryAddress,
      specialInstructions,
      promotionCode
    } = req.body;

    // Validate cafe exists and is active
    const cafe = await Cafe.findById(cafeId);
    if (!cafe || !cafe.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found or inactive'
      });
    }

    // Validate and calculate order
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await Menu.findById(item.menuId);
      if (!menuItem || !menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${item.menuId} is not available`
        });
      }

      // Check inventory availability
      if (menuItem.ingredients && menuItem.ingredients.length > 0) {
        for (const ingredient of menuItem.ingredients) {
          const inventory = await Inventory.findOne({
            cafeId,
            ingredient: ingredient.ingredient
          });

          if (!inventory || inventory.currentQuantity < (ingredient.amount * item.quantity)) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for ${ingredient.ingredient}`
            });
          }
        }
      }

      let itemPrice = menuItem.price;
      let customizationPrice = 0;

      // Calculate customization prices
      if (item.customizations) {
        for (const customization of item.customizations) {
          const menuCustomization = menuItem.customizations.find(
            c => c.name === customization.name
          );
          if (menuCustomization) {
            for (const option of customization.options) {
              const optionData = menuCustomization.options.find(o => o.name === option);
              if (optionData) {
                customizationPrice += optionData.price;
              }
            }
          }
        }
      }

      const itemSubtotal = (itemPrice + customizationPrice) * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        menuId: item.menuId,
        name: menuItem.name,
        price: itemPrice,
        quantity: item.quantity,
        customizations: item.customizations || [],
        specialInstructions: item.specialInstructions || '',
        subtotal: itemSubtotal
      });
    }

    // Apply promotion if provided
    let discount = 0;
    let validPromotion = null;
    
    if (promotionCode) {
      const promotion = await Promotion.findOne({
        cafeId,
        code: promotionCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (promotion && promotion.isCurrentlyValid()) {
        // Check minimum order amount
        if (!promotion.minimumOrderAmount || subtotal >= promotion.minimumOrderAmount) {
          if (promotion.type === 'percentage') {
            discount = (subtotal * promotion.discountValue) / 100;
            if (promotion.maximumDiscountAmount) {
              discount = Math.min(discount, promotion.maximumDiscountAmount);
            }
          } else if (promotion.type === 'fixed-amount') {
            discount = Math.min(promotion.discountValue, subtotal);
          }
          
          validPromotion = promotion;
        }
      }
    }

    const tax = subtotal * (cafe.settings?.taxRate || 0);
    const total = subtotal + tax - discount;

    // Create order
    const orderData = {
      cafeId,
      customerId: req.user?.id,
      items: orderItems,
      pricing: {
        subtotal,
        tax,
        discount,
        promotionCode: validPromotion?.code,
        total
      },
      customerInfo,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
      specialInstructions,
      estimatedReadyTime: new Date(Date.now() + (menuItem?.preparationTime || 15) * 60000)
    };

    const order = await Order.create(orderData);

    // Update inventory
    for (const item of items) {
      const menuItem = await Menu.findById(item.menuId);
      if (menuItem.ingredients) {
        for (const ingredient of menuItem.ingredients) {
          const inventory = await Inventory.findOne({
            cafeId,
            ingredient: ingredient.ingredient
          });

          if (inventory) {
            await inventory.addStockMovement(
              'out',
              ingredient.amount * item.quantity,
              'Order consumption',
              order._id,
              `Order ${order.orderNumber}`
            );

            // Check for low stock alert
            if (inventory.isLowStock) {
              await inventory.createAlert(
                'low-stock',
                `Low stock alert: ${inventory.ingredient} is running low`
              );
            }
          }
        }
      }

      // Update menu item order count
      menuItem.orderCount += item.quantity;
      await menuItem.save();
    }

    // Update promotion usage
    if (validPromotion) {
      validPromotion.usageCount.total += 1;
      if (req.user?.id) {
        const customerUsage = validPromotion.usageCount.byCustomer.find(
          u => u.customerId.toString() === req.user.id
        );
        if (customerUsage) {
          customerUsage.count += 1;
        } else {
          validPromotion.usageCount.byCustomer.push({
            customerId: req.user.id,
            count: 1
          });
        }
      }
      await validPromotion.save();
    }

    // Send notification to cafe owner (if OneSignal is configured)
    // try {
    //   const client = new OneSignal.Client(process.env.ONESIGNAL_APP_ID, process.env.ONESIGNAL_API_KEY);
    //   await client.createNotification({
    //     contents: { en: `New order #${order.orderNumber} received${tableNumber ? ` at table ${tableNumber}` : ''}` },
    //     include_external_user_ids: [cafe.ownerId.toString()],
    //   });
    // } catch (notificationError) {
    //   console.error('Notification error:', notificationError);
    // }

    const populatedOrder = await Order.findById(order._id)
      .populate('items.menuId', 'name price description');

    res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Cafe Owner)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the cafe
    const cafe = await Cafe.findById(order.cafeId);
    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update status history
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      note: note || `Status changed from ${order.status} to ${status}`
    });

    order.status = status;

    // Update timestamps based on status
    if (status === 'ready') {
      order.actualReadyTime = new Date();
    } else if (status === 'served' || status === 'completed') {
      order.servedTime = new Date();
    }

    await order.save();

    // Send notification to customer (if OneSignal is configured)
    // try {
    //   const client = new OneSignal.Client(process.env.ONESIGNAL_APP_ID, process.env.ONESIGNAL_API_KEY);
    //   if (order.customerId) {
    //     await client.createNotification({
    //       contents: { en: `Your order #${order.orderNumber} is now ${status}` },
    //       include_external_user_ids: [order.customerId.toString()],
    //     });
    //   }
    // } catch (notificationError) {
    //   console.error('Notification error:', notificationError);
    // }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get customer orders
// @route   GET /api/orders/my
// @access  Private (Customer)
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { customerId: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const orders = await Order.find(query)
      .populate('cafeId', 'name address contact')
      .populate('items.menuId', 'name price description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: orders
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    let authorized = false;
    if (req.user.role === 'customer' && order.customerId?.toString() === req.user.id) {
      authorized = true;
    } else if (req.user.role === 'cafeowner') {
      const cafe = await Cafe.findById(order.cafeId);
      if (cafe.ownerId.toString() === req.user.id) {
        authorized = true;
      }
    } else if (req.user.role === 'admin') {
      authorized = true;
    }

    if (!authorized) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['completed', 'served', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Restore inventory if order was confirmed/preparing
    if (['confirmed', 'preparing'].includes(order.status)) {
      for (const item of order.items) {
        const menuItem = await Menu.findById(item.menuId);
        if (menuItem && menuItem.ingredients) {
          for (const ingredient of menuItem.ingredients) {
            const inventory = await Inventory.findOne({
              cafeId: order.cafeId,
              ingredient: ingredient.ingredient
            });

            if (inventory) {
              await inventory.addStockMovement(
                'in',
                ingredient.amount * item.quantity,
                'Order cancellation',
                order._id,
                `Order ${order.orderNumber} cancelled`
              );
            }
          }
        }
      }
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: req.body.reason || 'Order cancelled'
    });

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Rate order
// @route   PUT /api/orders/:id/rating
// @access  Private (Customer)
export const rateOrder = async (req, res) => {
  try {
    const { score, comment } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is the customer who placed the order
    if (order.customerId?.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to rate this order'
      });
    }

    // Check if order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order must be completed to rate it'
      });
    }

    // Check if already rated
    if (order.rating?.score) {
      return res.status(400).json({
        success: false,
        message: 'Order has already been rated'
      });
    }

    order.rating = {
      score,
      comment,
      ratedAt: new Date()
    };

    await order.save();

    // Update cafe rating
    const cafe = await Cafe.findById(order.cafeId);
    const orders = await Order.find({
      cafeId: order.cafeId,
      'rating.score': { $exists: true }
    });

    const totalRating = orders.reduce((sum, o) => sum + o.rating.score, 0);
    const avgRating = totalRating / orders.length;

    cafe.rating = {
      average: Math.round(avgRating * 10) / 10,
      count: orders.length
    };

    await cafe.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Rate order error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};