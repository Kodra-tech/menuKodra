import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ModifierSelection = {
  groupId: string
  groupName: string
  optionId: string
  optionName: string
  priceDelta: number
}

export type CartItem = {
  cartId: string
  menuItemId: string
  name: string
  basePrice: number
  quantity: number
  modifiers: ModifierSelection[]
  specialInstructions: string
  subtotal: number
}

type SessionData = {
  restaurantId: string
  tableId: string
  sessionId: string
}

type CartStore = {
  items: CartItem[]
  restaurantId: string | null
  tableId: string | null
  sessionId: string | null

  initSession: (data: SessionData) => void
  addItem: (item: Omit<CartItem, 'cartId' | 'subtotal'>) => void
  removeItem: (cartId: string) => void
  incrementItem: (cartId: string) => void
  decrementItem: (cartId: string) => void
  clearItems: () => void
  itemCount: () => number
  total: () => number
}

function calcSubtotal(item: Omit<CartItem, 'cartId' | 'subtotal'>): number {
  const modifiersTotal = item.modifiers.reduce((acc, m) => acc + m.priceDelta, 0)
  return (item.basePrice + modifiersTotal) * item.quantity
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      tableId: null,
      sessionId: null,

      initSession: (data) =>
        set((state) => ({
          ...data,
          // Si la sesión cambió (nueva visita), limpia el carrito
          items: state.sessionId !== data.sessionId ? [] : state.items,
        })),

      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              ...item,
              cartId: crypto.randomUUID(),
              subtotal: calcSubtotal(item),
            },
          ],
        })),

      removeItem: (cartId) =>
        set((state) => ({
          items: state.items.filter((i) => i.cartId !== cartId),
        })),

      incrementItem: (cartId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.cartId === cartId
              ? { ...i, quantity: i.quantity + 1, subtotal: calcSubtotal({ ...i, quantity: i.quantity + 1 }) }
              : i,
          ),
        })),

      decrementItem: (cartId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.cartId === cartId
                ? { ...i, quantity: i.quantity - 1, subtotal: calcSubtotal({ ...i, quantity: i.quantity - 1 }) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),

      clearItems: () => set({ items: [] }),

      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      total: () => get().items.reduce((acc, i) => acc + i.subtotal, 0),
    }),
    {
      name: 'menukodra-cart',
      // Solo persiste el carrito y los IDs de sesión
      partialize: (state) => ({
        items: state.items,
        restaurantId: state.restaurantId,
        tableId: state.tableId,
        sessionId: state.sessionId,
      }),
    },
  ),
)
