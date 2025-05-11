import React, { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartProps {
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ onClose }) => {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (items.length === 0) {
    return (
      <div ref={cartRef} className="fixed right-4 top-20 bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="text-center py-8">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={cartRef} className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.membership.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{item.membership.name}</h3>
                    <p className="text-sm text-gray-500">£{item.membership.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.membership.id, item.quantity - 1)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      -
                    </button>
                    <span className="text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.membership.id, item.quantity + 1)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.membership.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between mb-4">
              <span className="text-lg font-medium text-gray-900">Total</span>
              <span className="text-lg font-medium text-gray-900">£{total}</span>
            </div>
            <button
              onClick={() => {
                // Handle checkout
                onClose();
              }}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 