import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface CartItem {
  id: string;
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: Array<{
    name: string;
    options: string[];
    additionalPrice: number;
  }>;
  specialInstructions?: string;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  total: number;
  cafeId: string | null;
  cafeName: string | null;
  promoCode: string | null;
  discount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem & { cafeId: string; cafeName: string } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'APPLY_PROMO'; payload: { code: string; discount: number } }
  | { type: 'REMOVE_PROMO' }
  | { type: 'SET_CART'; payload: CartState };

const initialState: CartState = {
  items: [],
  total: 0,
  cafeId: null,
  cafeName: null,
  promoCode: null,
  discount: 0,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { cafeId, cafeName, ...item } = action.payload;
      
      // If adding item from different cafe, clear cart first
      if (state.cafeId && state.cafeId !== cafeId) {
        return {
          ...initialState,
          items: [item],
          total: item.subtotal,
          cafeId,
          cafeName,
        };
      }

      // Check if item already exists with same customizations
      const existingItemIndex = state.items.findIndex(
        (existingItem) =>
          existingItem.menuId === item.menuId &&
          JSON.stringify(existingItem.customizations) === JSON.stringify(item.customizations)
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((existingItem, index) =>
          index === existingItemIndex
            ? {
                ...existingItem,
                quantity: existingItem.quantity + item.quantity,
                subtotal: (existingItem.quantity + item.quantity) * existingItem.price,
              }
            : existingItem
        );
      } else {
        // Add new item
        newItems = [...state.items, item];
      }

      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        cafeId: cafeId || state.cafeId,
        cafeName: cafeName || state.cafeName,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.id !== action.payload);
      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
        ...(newItems.length === 0 && {
          cafeId: null,
          cafeName: null,
          promoCode: null,
          discount: 0,
        }),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: id });
      }

      const newItems = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.price,
            }
          : item
      );

      const newTotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

      return {
        ...state,
        items: newItems,
        total: newTotal,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'APPLY_PROMO':
      return {
        ...state,
        promoCode: action.payload.code,
        discount: action.payload.discount,
      };

    case 'REMOVE_PROMO':
      return {
        ...state,
        promoCode: null,
        discount: 0,
      };

    case 'SET_CART':
      return action.payload;

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem, cafeId: string, cafeName: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (code: string, discount: number) => void;
  removePromo: () => void;
  getItemCount: () => number;
  getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'SET_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error parsing saved cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addItem = (item: CartItem, cafeId: string, cafeName: string) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...item, cafeId, cafeName },
    });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyPromo = (code: string, discount: number) => {
    dispatch({ type: 'APPLY_PROMO', payload: { code, discount } });
  };

  const removePromo = () => {
    dispatch({ type: 'REMOVE_PROMO' });
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getFinalTotal = () => {
    return Math.max(0, state.total - state.discount);
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyPromo,
    removePromo,
    getItemCount,
    getFinalTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};