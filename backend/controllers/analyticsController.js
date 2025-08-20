import Order from '../models/Order.js';
import Menu from '../models/Menu.js';
import Cafe from '../models/Cafe.js';

// @desc    Get cafe analytics
// @route   GET /api/cafes/:cafeId/analytics
// @access  Private (Cafe Owner)
export const getCafeAnalytics = async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { startDate, endDate, period = 'daily' } = req.query;

    // Date range setup
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get orders for the period
    const orders = await Order.find({
      cafeId,
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['completed', 'paid'] }
    }).populate('items.menuItemId');

    // Calculate basic metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.totalAmount, 0);
    const totalProfit = orders.reduce((sum, order) => sum + (order.pricing.profit || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by period
    const periodData = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      let key;
      
      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!periodData[key]) {
        periodData[key] = {
          date: key,
          revenue: 0,
          profit: 0,
          orders: 0
        };
      }

      periodData[key].revenue += order.pricing.totalAmount;
      periodData[key].profit += order.pricing.profit || 0;
      periodData[key].orders += 1;
    });

    // Top selling items
    const itemSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const itemId = item.menuItemId._id.toString();
        const itemName = item.menuItemId.name;
        
        if (!itemSales[itemId]) {
          itemSales[itemId] = {
            name: itemName,
            quantity: 0,
            revenue: 0,
            profit: 0
          };
        }
        
        itemSales[itemId].quantity += item.quantity;
        itemSales[itemId].revenue += item.price * item.quantity;
        itemSales[itemId].profit += (item.profit || 0) * item.quantity;
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Order status distribution
    const allOrders = await Order.find({ cafeId, createdAt: { $gte: start, $lte: end } });
    const statusDistribution = allOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalProfit,
          totalOrders,
          averageOrderValue,
          profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
        },
        periodData: Object.values(periodData).sort((a, b) => new Date(a.date) - new Date(b.date)),
        topItems,
        statusDistribution,
        dateRange: { start, end }
      }
    });
  } catch (error) {
    console.error('Get cafe analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get super admin analytics
// @route   GET /api/admin/analytics
// @access  Private (Super Admin)
export const getSuperAdminAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Total cafes
    const totalCafes = await Cafe.countDocuments();
    const activeCafes = await Cafe.countDocuments({ isActive: true });
    
    // Total orders and revenue across all cafes
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['completed', 'paid'] }
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.totalAmount, 0);
    const totalOrders = orders.length;

    // Top performing cafes
    const cafePerformance = {};
    orders.forEach(order => {
      const cafeId = order.cafeId.toString();
      if (!cafePerformance[cafeId]) {
        cafePerformance[cafeId] = {
          cafeId,
          revenue: 0,
          orders: 0
        };
      }
      cafePerformance[cafeId].revenue += order.pricing.totalAmount;
      cafePerformance[cafeId].orders += 1;
    });

    // Get cafe details for top performers
    const topCafeIds = Object.values(cafePerformance)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(cafe => cafe.cafeId);

    const topCafes = await Cafe.find({ _id: { $in: topCafeIds } })
      .populate('ownerId', 'name email')
      .select('name address revenue rating');

    // Combine cafe details with performance data
    const topPerformingCafes = topCafes.map(cafe => ({
      ...cafe.toObject(),
      performance: cafePerformance[cafe._id.toString()]
    }));

    // Monthly growth
    const monthlyData = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, orders: 0 };
      }
      monthlyData[month].revenue += order.pricing.totalAmount;
      monthlyData[month].orders += 1;
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCafes,
          activeCafes,
          totalRevenue,
          totalOrders,
          averageRevenuePerCafe: activeCafes > 0 ? totalRevenue / activeCafes : 0
        },
        topPerformingCafes,
        monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
          month,
          ...data
        })).sort((a, b) => a.month.localeCompare(b.month)),
        dateRange: { start, end }
      }
    });
  } catch (error) {
    console.error('Get super admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get profit margin analysis
// @route   GET /api/cafes/:cafeId/analytics/profit-margin
// @access  Private (Cafe Owner)
export const getProfitMarginAnalysis = async (req, res) => {
  try {
    const { cafeId } = req.params;
    
    // Get all menu items with their margins
    const menuItems = await Menu.find({ cafeId });
    
    // Get recent orders to calculate actual profit margins
    const recentOrders = await Order.find({
      cafeId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      status: { $in: ['completed', 'paid'] }
    }).populate('items.menuItemId');

    // Calculate profit margins by menu item
    const itemMargins = {};
    
    menuItems.forEach(item => {
      itemMargins[item._id.toString()] = {
        name: item.name,
        category: item.category,
        price: item.price,
        margin: item.margin || 0,
        theoreticalProfit: item.price * ((item.margin || 0) / 100),
        actualRevenue: 0,
        actualProfit: 0,
        unitsSold: 0
      };
    });

    // Calculate actual performance
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        const itemId = item.menuItemId._id.toString();
        if (itemMargins[itemId]) {
          itemMargins[itemId].actualRevenue += item.price * item.quantity;
          itemMargins[itemId].actualProfit += (item.profit || 0) * item.quantity;
          itemMargins[itemId].unitsSold += item.quantity;
        }
      });
    });

    // Calculate actual margins
    Object.values(itemMargins).forEach(item => {
      if (item.actualRevenue > 0) {
        item.actualMarginPercent = (item.actualProfit / item.actualRevenue) * 100;
      } else {
        item.actualMarginPercent = 0;
      }
    });

    // Sort by profitability
    const sortedItems = Object.values(itemMargins)
      .sort((a, b) => b.actualProfit - a.actualProfit);

    res.status(200).json({
      success: true,
      data: {
        items: sortedItems,
        summary: {
          totalItems: menuItems.length,
          averageMargin: sortedItems.reduce((sum, item) => sum + item.margin, 0) / sortedItems.length,
          totalRevenue: sortedItems.reduce((sum, item) => sum + item.actualRevenue, 0),
          totalProfit: sortedItems.reduce((sum, item) => sum + item.actualProfit, 0)
        }
      }
    });
  } catch (error) {
    console.error('Get profit margin analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};