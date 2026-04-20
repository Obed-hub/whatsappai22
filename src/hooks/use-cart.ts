'use client'

import { useState, useEffect, useCallback } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('whatsstore-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart', e)
      }
    }
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('whatsstore-cart', JSON.stringify(items))
  }, [items])

  const addToCart = useCallback((product: any) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
        quantity: 1
      }]
    })
    setIsOpen(true)
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id)
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])
    localStorage.removeItem('whatsstore-cart')
  }, [])

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const count = items.reduce((acc, item) => acc + item.quantity, 0)

  return {
    items,
    isOpen,
    setIsOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
    count
  }
}
