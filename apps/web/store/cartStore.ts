import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api";
import Cookies from "js-cookie";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  
  // Wishlist
  wishlist: string[]; // array of product IDs
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  
  // Syncing
  syncCart: () => Promise<void>;
  syncWishlist: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      wishlist: [],
      
      addItem: async (newItem) => {
        const token = Cookies.get("user_access_token");
        if (token) {
          try {
            await api.post('/cart/items', { productId: newItem.id, quantity: newItem.quantity });
          } catch (error) {
            console.error("Failed to add to cart on server", error);
          }
        }
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      
      removeItem: async (id) => {
        const token = Cookies.get("user_access_token");
        if (token) {
          try {
            await api.delete(`/cart/items/${id}`);
          } catch (error) {
            console.error("Failed to remove item on server", error);
          }
        }
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: async (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const token = Cookies.get("user_access_token");
        if (token) {
          try {
            await api.patch(`/cart/items/${id}`, { quantity });
          } catch (error) {
            console.error("Failed to update quantity on server", error);
          }
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      clearCart: async () => {
        const token = Cookies.get("user_access_token");
        if (token) {
          try {
            await api.delete('/cart');
          } catch (error) {
            console.error("Failed to clear cart on server", error);
          }
        }
        set({ items: [] });
      },
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      toggleWishlist: async (productId) => {
        const token = Cookies.get("user_access_token");
        const exists = get().wishlist.includes(productId);
        
        if (token) {
          try {
            if (exists) {
              await api.delete(`/wishlist/items/${productId}`);
            } else {
              await api.post('/wishlist/items', { productId });
            }
          } catch (error) {
            console.error("Failed to toggle wishlist on server", error);
          }
        }

        set((state) => {
          if (exists) {
            return { wishlist: state.wishlist.filter(id => id !== productId) };
          } else {
            return { wishlist: [...state.wishlist, productId] };
          }
        });
      },
      
      isInWishlist: (productId) => {
        return get().wishlist.includes(productId);
      },
      
      syncCart: async () => {
        const token = Cookies.get("user_access_token");
        if (!token) return;
        try {
          const currentLocalItems = get().items;
          const { data } = await api.get('/cart');
          
          // If server cart is empty but user has local items, push them to database
          if (data && (!data.items || data.items.length === 0) && currentLocalItems.length > 0) {
            for (const item of currentLocalItems) {
              try {
                await api.post('/cart/items', { productId: item.id, quantity: item.quantity });
              } catch (e) {}
            }
            const refreshed = await api.get('/cart');
            if (refreshed.data && refreshed.data.items) {
              const mapped = refreshed.data.items.map((i: any) => ({
                id: i.product.id,
                name: i.product.name,
                price: parseFloat(i.product.discountPrice ? i.product.discountPrice : i.product.price),
                image: i.product.image || '',
                quantity: i.quantity,
                category: i.product.categoryId
              }));
              set({ items: mapped });
              return;
            }
          }

          if (data && data.items) {
             const mappedItems = data.items.map((i: any) => ({
               id: i.product.id,
               name: i.product.name,
               price: parseFloat(i.product.discountPrice ? i.product.discountPrice : i.product.price),
               image: i.product.image || '',
               quantity: i.quantity,
               category: i.product.categoryId
             }));
             set({ items: mappedItems });
          }
        } catch (error) {
          console.error("Failed to sync cart", error);
        }
      },

      syncWishlist: async () => {
        const token = Cookies.get("user_access_token");
        if (!token) return;
        try {
          const { data } = await api.get('/wishlist');
          if (Array.isArray(data)) {
            set({ wishlist: data.map((w: any) => w.productId) });
          }
        } catch (error) {
          console.error("Failed to sync wishlist", error);
        }
      }
    }),
    {
      name: "cart-storage", // stores cart and wishlist in local storage
    }
  )
);
