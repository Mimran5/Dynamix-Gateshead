import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="fixed right-4 top-20 bg-white rounded-lg shadow-lg p-4 w-80">
        <div className="text-center py-8">
          <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-4 top-20 bg-white rounded-lg shadow-lg p-4 w-80">
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.membership.id} className="flex items-center justify-between border-b pb-4">
            <div className="flex-1">
              <h3 className="font-medium">{item.membership.name}</h3>
              <p className="text-sm text-gray-600">£{item.membership.price}/month</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.membership.id, item.quantity - 1)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Minus size={16} />
              </button>
              <span className="font-medium">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.membership.id, item.quantity + 1)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={() => removeFromCart(item.membership.id)}
                className="p-1 rounded-full hover:bg-red-100 text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold">Total:</span>
          <span className="font-bold">£{total}</span>
        </div>
        <button
          onClick={() => navigate('/checkout')}
          className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart; 