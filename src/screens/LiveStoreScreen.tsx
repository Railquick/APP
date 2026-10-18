import React, { useState } from 'react';
import { Search, Train, ShoppingBag, Plus, Minus, Check, ArrowRight, User, ChevronDown, Clock, ShieldCheck } from 'lucide-react';
import { Station, ProductItem, CartItem } from '../types';
import { MOCK_PRODUCTS } from '../services/mockData';
import { StationPickerModal } from '../components/StationPickerModal';
import { ProfileDrawer } from '../components/ProfileDrawer';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface LiveStoreScreenProps {
  currentStation: Station;
  phoneNumber: string;
  onSelectStation: (station: Station) => void;
  onLogout: () => void;
}

export const LiveStoreScreen: React.FC<LiveStoreScreenProps> = ({
  currentStation,
  phoneNumber,
  onSelectStation,
  onLogout,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPickerModal, setShowPickerModal] = useState<boolean>(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);
  const [coachDetails, setCoachDetails] = useState({ train: '12952 Rajdhani', coach: 'B3', berth: '27' });

  const categories = ['All', 'Chai & Beverages', 'Hot Meals', 'Train Snacks', 'Travel Essentials', 'Baby Care'];

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getQuantity = (productId: string) => {
    return cart.find((item) => item.product.id === productId)?.quantity || 0;
  };

  const handleAddToCart = (product: ProductItem) => {
    sounds.tap();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    sounds.tap();
    setCart((prev) => {
      return prev
        .map((item) => (item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0);
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    sounds.success();
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#008b3e', '#e23744', '#facc15'],
      });
    } catch {}
    setOrderPlaced(true);
  };

  return (
    <div className="relative w-full h-full min-h-[720px] bg-slate-50 flex flex-col justify-between overflow-x-hidden">
      {/* 1. Header Bar */}
      <div className="w-full px-4 pt-3 pb-2.5 bg-white shadow-2xs sticky top-0 z-30 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div
            onClick={() => {
              sounds.tap();
              setShowPickerModal(true);
            }}
            className="flex flex-col cursor-pointer group"
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black tracking-wider uppercase text-emerald-800">
                10 MINS TO COACH
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-slate-800 font-bold text-sm group-hover:text-emerald-700 transition-colors">
              <span>{currentStation.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </div>
            <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
              {currentStation.pocketName || currentStation.addressSnippet}
            </span>
          </div>

          <button
            onClick={() => {
              sounds.tap();
              setShowProfileDrawer(true);
            }}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 flex items-center justify-center text-slate-700"
          >
            <User className="w-5 h-5" />
          </button>
        </div>

        {/* Coach / Seat Delivery Info Bar */}
        <div className="mt-2.5 p-2 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Train className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-emerald-950">
              {coachDetails.train} • Coach {coachDetails.coach}, Seat {coachDetails.berth}
            </span>
          </div>
          <button
            onClick={() => {
              const coach = prompt('Enter Coach & Seat number (e.g. B4-32):', `${coachDetails.coach}-${coachDetails.berth}`);
              if (coach) {
                const parts = coach.split('-');
                setCoachDetails((prev) => ({ ...prev, coach: parts[0] || 'B4', berth: parts[1] || '32' }));
              }
            }}
            className="text-[11px] font-bold text-emerald-700 underline"
          >
            Change
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-2.5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chai, biryani, snacks, medicines..."
            className="w-full pl-9 pr-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2.5 pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sounds.tap();
                setActiveCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#008b3e] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Products Grid */}
      <div className="flex-1 p-4 pb-28 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {activeCategory} ({filteredProducts.length})
          </span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Fast Station Pantry
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const qty = getQuantity(product.id);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all"
              >
                <div>
                  <div className="w-full h-24 bg-slate-50 rounded-xl flex items-center justify-center text-4xl mb-2 relative">
                    <span>{product.imageUrl}</span>
                    {product.tag && (
                      <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                        {product.tag}
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1.5 bg-white/90 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                      ⏱ {product.deliveryTimeMins}m
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {product.name}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {product.weightOrVolume}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-sm font-black text-slate-900">₹{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through ml-1 font-medium">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-1.5 rounded-xl border-2 border-[#008b3e] text-[#008b3e] hover:bg-[#008b3e] hover:text-white font-extrabold text-xs active:scale-95 transition-all shadow-xs"
                    >
                      + ADD
                    </button>
                  ) : (
                    <div className="flex items-center bg-[#008b3e] text-white rounded-xl px-1.5 py-1 gap-2 shadow-xs">
                      <button
                        onClick={() => handleRemoveFromCart(product.id)}
                        className="w-5 h-5 flex items-center justify-center active:scale-90"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black min-w-[12px] text-center">{qty}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-5 h-5 flex items-center justify-center active:scale-90"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Floating Bottom Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 p-4 z-40 bg-gradient-to-t from-white via-white/95 to-transparent">
          <div
            onClick={() => {
              sounds.tap();
              setShowCartDrawer(true);
            }}
            className="w-full max-w-sm mx-auto bg-[#008b3e] hover:bg-[#007a36] text-white p-3.5 rounded-2xl shadow-xl shadow-emerald-700/25 flex items-center justify-between cursor-pointer active:scale-98 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
                {totalItems}
              </div>
              <div>
                <div className="text-xs uppercase font-extrabold text-emerald-100">
                  Total (Coach Delivery)
                </div>
                <div className="text-base font-black leading-none mt-0.5">₹{subtotal}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-extrabold text-sm">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Cart & Checkout Drawer Modal */}
      {showCartDrawer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setShowCartDrawer(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {orderPlaced ? (
              <div className="py-6 flex flex-col items-center text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-emerald-100 text-[#008b3e] rounded-full flex items-center justify-center mb-3">
                  <Check className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">Order Confirmed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Assigned to RailQuick Partner at {currentStation.name}
                </p>

                <div className="w-full my-4 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-left text-xs">
                  <div className="font-bold text-emerald-900">Delivery Target: 10 mins</div>
                  <div className="text-emerald-700 mt-0.5">
                    Train: {coachDetails.train} • Coach {coachDetails.coach}, Seat {coachDetails.berth}
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-800 bg-white/80 p-2 rounded-lg">
                    🚆 Delivery guy will hand over package at your train window/door before departure!
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCart([]);
                    setOrderPlaced(false);
                    setShowCartDrawer(false);
                  }}
                  className="w-full bg-[#008b3e] text-white font-bold py-3.5 rounded-xl text-sm"
                >
                  Back to Store
                </button>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Coach Delivery Cart</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Delivering to: <strong className="text-slate-800">{coachDetails.train}</strong> ({coachDetails.coach}-{coachDetails.berth})
                </p>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800">{item.product.name}</div>
                        <div className="text-[11px] text-slate-400">₹{item.product.price} × {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">₹{item.product.price * item.quantity}</span>
                        <div className="flex items-center bg-slate-100 rounded-lg px-1.5 py-0.5 gap-1">
                          <button onClick={() => handleRemoveFromCart(item.product.id)} className="font-bold text-slate-600">-</button>
                          <span className="text-xs font-bold px-1">{item.quantity}</span>
                          <button onClick={() => handleAddToCart(item.product)} className="font-bold text-slate-600">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs mb-5">
                  <div className="flex justify-between text-slate-600">
                    <span>Item Total</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Platform Delivery Fee</span>
                    <span className="text-emerald-600 font-bold">FREE (Launch Offer)</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                    <span>To Pay</span>
                    <span>₹{subtotal}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#008b3e] text-white font-black py-4 rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Pay ₹{subtotal} & Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <StationPickerModal
        isOpen={showPickerModal}
        currentStation={currentStation}
        onSelectStation={onSelectStation}
        onClose={() => setShowPickerModal(false)}
      />

      <ProfileDrawer
        isOpen={showProfileDrawer}
        phoneNumber={phoneNumber}
        onClose={() => setShowProfileDrawer(false)}
        onLogout={onLogout}
        onOpenHelp={() => setShowProfileDrawer(false)}
      />
    </div>
  );
};
