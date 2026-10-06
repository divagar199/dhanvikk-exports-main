import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { closeCart, updateQuantity, removeItem } from '../../store/slices/cartSlice';
import Button from '../common/Button';
import { toast } from 'sonner';
import { useCurrency } from '../../context/CurrencyContext';

export default function CartDrawer() {
  const { formatPrice } = useCurrency();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, isOpen } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 1999 || subtotal === 0 ? 0 : 149;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckoutClick = () => {
    dispatch(closeCart());

    if (!isAuthenticated) {
      toast.info('Please sign in to add your delivery address and complete payment 🌸', {
        duration: 4000,
      });
      // Redirect to /login with state.from = /checkout so after login they return straight to checkout!
      navigate('/login', {
        state: { from: { pathname: '/checkout' } },
      });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#242124]/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={() => dispatch(closeCart())}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FFFDF9] border-l border-[#F7F2ED] shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-5 border-b border-[#F7F2ED] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#FFF3F6] flex items-center justify-center text-[#EC407A]">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[#242124] font-['Poppins']">
                  Your Floral Cart
                </h2>
                <span className="text-xs text-[#777777]">
                  {items.length} {items.length === 1 ? 'bouquet' : 'bouquets'} selected
                </span>
              </div>
            </div>

            <button
              onClick={() => dispatch(closeCart())}
              className="p-2 rounded-xl text-[#777777] hover:text-[#242124] hover:bg-[#FFF3F6] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#FFF3F6] text-[#EC407A] flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-[#242124]">Your cart is empty</h3>
                <p className="text-xs text-[#777777] max-w-xs mt-1 mb-6">
                  Explore our luxury botanical arrangements and fresh blossoms to add warmth to your moments.
                </p>
                <Button variant="primary" size="sm" onClick={() => dispatch(closeCart())}>
                  Browse Blooms
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 bg-white rounded-2xl border border-[#F7F2ED] shadow-xs"
                >
                  <img
                    src={item.image}
                    alt={`${item.name} floral bouquet in cart`}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-[13px] font-semibold text-[#242124] leading-snug line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => dispatch(removeItem(item.id))}
                          className="text-[#777777] hover:text-[#C2185B] p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[11px] text-[#777777] block mt-0.5">{item.category}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-[#C2185B] font-mono">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#E5E1E2] rounded-lg overflow-hidden bg-[#FFFDF9]">
                        <button
                          onClick={() =>
                            dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                          }
                          className="px-2 py-1 text-xs hover:bg-[#FFF3F6] text-[#777777]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() =>
                            dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                          }
                          className="px-2 py-1 text-xs hover:bg-[#FFF3F6] text-[#777777]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#F7F2ED] bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-[#777777]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-[#242124] font-medium font-mono">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-medium font-mono">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600 font-semibold">FREE</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-[#242124] pt-2 border-t border-[#F7F2ED]">
                  <span>Total Amount</span>
                  <span className="text-[#C2185B] font-mono">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Login requirement reminder microcopy if not logged in */}
              {!isAuthenticated && (
                <div className="p-2.5 bg-[#FFF3F6] rounded-xl border border-[#FCC1C5]/50 text-[11px] text-[#C2185B] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>Customer sign-in required to enter delivery address and pay.</span>
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                onClick={handleCheckoutClick}
                className="gap-2 text-[14px]"
              >
                <span>{isAuthenticated ? 'Proceed to Delivery & Payment' : 'Login to Checkout'}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
