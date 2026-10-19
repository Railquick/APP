import React, { useState } from 'react';
import { Search, Train, ChevronDown, User, Plus, Minus, ArrowRight, CheckCircle2, Clock, ShieldCheck, X, Sparkles, Navigation } from 'lucide-react';
import { ProductItem, CartItem, TrainRoute, UserProfile } from '../types';
import { MOCK_PRODUCTS, INITIAL_TRAINS } from '../services/mockData';
import { ProfileDrawer } from '../components/ProfileDrawer';
import { sounds } from '../services/soundEffects';
import confetti from 'canvas-confetti';

interface ZeptoStoreScreenProps {
  userProfile?: UserProfile | null;
  phoneNumber?: string;
  onLogout: () => void;
}

export const ZeptoStoreScreen: React.FC<ZeptoStoreScreenProps> = ({
  userProfile,
  phoneNumber = '+91 98765 43210',
  onLogout,
}) => {
  const [selectedTrain, setSelectedTrain] = useState<TrainRoute>(INITIAL_TRAINS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showTrainPicker, setShowTrainPicker] = useState<boolean>(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState<boolean>(false);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [orderTracking, setOrderTracking] = useState<boolean>(false);
  const [coachBerth, setCoachBerth] = useState<{ coach: string; berth: string }>({
    coach: 'B3',
    berth: '24',
  });

  const categories = [
    'All',
    'Chai & Drinks',
    'Hot Meals',
    'Snacks',
    'Rail Neer',
    'Chocolates',
    'Essentials',
  ];

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getQuantity = (id: string) => cart.find((i) => i.product.id === id)?.quantity || 0;

  const handleAddToCart = (product: ProductItem) => {
    sounds.tap();
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    sounds.tap();
    setCart((prev) => {
      return prev
        .map((i) => (i.product.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
    });
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const handlePlaceOrder = () => {
    sounds.success();
    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#008b3e', '#e23744', '#facc15', '#38bdf8'],
      });
    } catch {}
    setOrderTracking(true);
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-hidden select-none relative font-sans">
      {/* 1. Zepto-Style Header Bar */}
      <header className="w-full bg-white px-4 pt-3 pb-2.5 border-b border-slate-100 shadow-2xs z-30 shrink-0">
        <div className="flex items-center justify-between gap-2">
          {/* Left: 10-Min Delivery + Train Selector */}
          <div
            onClick={() => {
              sounds.tap();
              setShowTrainPicker(true);
            }}
            className="flex flex-col cursor-pointer group flex-1 min-w-0"
          >
            <div className="flex items-center gap-1.5">
              <span className="bg-[#008b3e] text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 tracking-wider uppercase">
                ⚡ 10 MINS
              </span>
              <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-tight">
                To Your Train Seat
              </span>
            </div>

            <div className="flex items-center gap-1 mt-1 text-slate-900 font-black text-[13px] group-hover:text-emerald-700 transition-colors">
              <span className="truncate">
                {selectedTrain.trainNumber} {selectedTrain.trainName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            </div>

            <div className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
              <span>Coach {coachBerth.coach}, Berth {coachBerth.berth}</span>
              <span>•</span>
              <span className="truncate">{selectedTrain.route}</span>
            </div>
          </div>

          {/* Right: Profile Avatar Button */}
          <button
            onClick={() => {
              sounds.tap();
              setShowProfileDrawer(true);
            }}
            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-200 active:scale-95 transition-all shrink-0"
            title="Profile & Settings"
          >
            {userProfile?.name ? (
              <span className="font-bold text-sm text-emerald-800">
                {userProfile.name.charAt(0)}
              </span>
            ) : (
              <User className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-2.5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search "chai", "biryani", "samosa", "water"...'
            className="w-full pl-9 pr-3.5 py-2 bg-slate-100/90 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-600 transition-all"
          />
        </div>

        {/* Category Pills (Horizontal Scroll) */}
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
      </header>

      {/* 2. Main Scrollable Products Section */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 pb-24 no-scrollbar">
        {/* Zepto-Style Promo Card */}
        <div className="w-full bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-2xl p-3.5 shadow-xs relative overflow-hidden flex items-center justify-between">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <Sparkles className="w-2.5 h-2.5" /> Launch Offer
            </div>
            <div className="text-sm font-black tracking-tight leading-snug">
              FREE Berth Delivery
            </div>
            <p className="text-[11px] text-teal-200 mt-0.5 font-medium">
              Direct to Coach {coachBerth.coach}, Seat {coachBerth.berth}
            </p>
          </div>
          <div className="text-3xl shrink-0 pr-1 animate-pulse">🚆</div>
        </div>

        {/* Section Heading */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
            {activeCategory} ({filteredProducts.length})
          </span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Station Kitchen Fresh
          </span>
        </div>

        {/* 2-Column Responsive Product Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((product) => {
            const qty = getQuantity(product.id);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Product Visual Container */}
                  <div className="w-full h-24 bg-slate-50/90 rounded-xl flex items-center justify-center text-4xl mb-2 relative overflow-hidden">
                    <span>{product.imageUrl}</span>
                    {product.tag && (
                      <span className="absolute top-1.5 left-1.5 bg-[#008b3e] text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-md">
                        {product.tag}
                      </span>
                    )}
                    <span className="absolute bottom-1 right-1.5 bg-white/95 text-slate-700 text-[8.5px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs flex items-center gap-0.5">
                      ⏱ {product.deliveryTimeMins}m
                    </span>
                  </div>

                  {/* Title & Weight */}
                  <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="text-[10.5px] text-slate-400 mt-0.5 font-medium">
                    {product.weightOrVolume}
                  </div>
                </div>

                {/* Price & Add Button */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-sm font-black text-slate-900">₹{product.price}</span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[10px] text-slate-400 line-through ml-1 font-medium">
                        ₹{product.originalPrice}
                      </span>
                    )}
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-3 py-1.5 rounded-xl border-2 border-[#008b3e] text-[#008b3e] hover:bg-[#008b3e] hover:text-white font-black text-xs active:scale-95 transition-all shadow-2xs"
                    >
                      + ADD
                    </button>
                  ) : (
                    <div className="flex items-center bg-[#008b3e] text-white rounded-xl px-1.5 py-1 gap-2 shadow-xs">
                      <button
                        onClick={() => handleRemoveFromCart(product.id)}
                        className="w-5 h-5 flex items-center justify-center active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-black min-w-[12px] text-center">{qty}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-5 h-5 flex items-center justify-center active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Floating Zepto-Style Bottom Cart Bar */}
      {totalItems > 0 && !showCartDrawer && (
        <div className="absolute bottom-3 inset-x-3 z-40 animate-in slide-in-from-bottom duration-300">
          <div
            onClick={() => {
              sounds.tap();
              setShowCartDrawer(true);
            }}
            className="w-full bg-[#008b3e] hover:bg-[#007a36] text-white p-3.5 rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
                {totalItems}
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase text-emerald-200 tracking-wider">
                  Deliver to Coach {coachBerth.coach}
                </div>
                <div className="text-base font-black leading-none mt-0.5">₹{subtotal}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider bg-white/15 px-3 py-2 rounded-xl">
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* 4. Cart & Checkout Bottom Sheet */}
      {showCartDrawer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowCartDrawer(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl p-5 shadow-2xl relative max-h-[88vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Your Train Cart</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedTrain.trainNumber} {selectedTrain.trainName}
                </p>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 active:scale-90 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Coach & Berth details editable */}
            <div className="my-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <span className="font-extrabold text-emerald-950 text-sm">
                  Coach {coachBerth.coach}, Berth {coachBerth.berth}
                </span>
              </div>
              <button
                onClick={() => {
                  const input = prompt('Enter Coach & Berth (e.g. B4-32):', `${coachBerth.coach}-${coachBerth.berth}`);
                  if (input) {
                    const parts = input.split('-');
                    setCoachBerth({ coach: parts[0] || 'B4', berth: parts[1] || '32' });
                  }
                }}
                className="text-xs font-bold text-emerald-700 underline"
              >
                Change
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 my-3 max-h-48 overflow-y-auto pr-1 no-scrollbar">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between text-xs py-2 border-b border-slate-100"
                >
                  <div>
                    <div className="font-bold text-slate-900">{item.product.name}</div>
                    <div className="text-[11px] text-slate-400">
                      ₹{item.product.price} × {item.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">
                      ₹{item.product.price * item.quantity}
                    </span>
                    <div className="flex items-center bg-slate-100 rounded-xl px-1.5 py-0.5 gap-1.5">
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="font-bold text-slate-700 px-1"
                      >
                        -
                      </button>
                      <span className="text-xs font-black">{item.quantity}</span>
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className="font-bold text-slate-700 px-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Details */}
            <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Items Total</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Berth Delivery Fee</span>
                <span className="text-emerald-700 font-bold">FREE (Launch Offer)</span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span>₹{subtotal}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-[#008b3e] hover:bg-[#007a36] text-white font-black py-4 rounded-2xl shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <span>Place Order • Pay ₹{subtotal}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Live Train Delivery Tracking Modal */}
      {orderTracking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#008b3e] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                Order #RQ-8429 Confirmed
              </span>

              <h2 className="text-xl font-black text-slate-900">
                Delivering in 10 Mins!
              </h2>

              <p className="text-xs text-slate-500 mt-1 mb-4">
                Target: {selectedTrain.trainNumber} {selectedTrain.trainName} • Coach {coachBerth.coach}, Berth {coachBerth.berth}
              </p>

              {/* Live Tracking Timeline */}
              <div className="w-full text-left space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs mb-5">
                <div className="flex items-start gap-2.5 text-emerald-800 font-bold">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <div>Order Received & Paid</div>
                    <div className="text-[10px] text-slate-400 font-normal">Sent to Platform Station Kitchen</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-emerald-800 font-bold">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <div>Food & Essentials Packed</div>
                    <div className="text-[10px] text-slate-400 font-normal">Hygienic sealed packaging verified</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-emerald-950 font-black">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 animate-ping text-white text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                    ●
                  </span>
                  <div>
                    <div className="text-[#008b3e]">Runner Walking down Platform A2</div>
                    <div className="text-[10px] text-slate-500 font-normal">Reaching Coach {coachBerth.coach} before departure!</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setCart([]);
                  setOrderTracking(false);
                  setShowCartDrawer(false);
                }}
                className="w-full bg-[#008b3e] text-white font-black py-3.5 rounded-2xl text-xs active:scale-98 transition-all"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Train Selector Modal */}
      {showTrainPicker && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
          onClick={() => setShowTrainPicker(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Select Train</h3>
                <p className="text-xs text-slate-500">Pick your Indian Railways journey</p>
              </div>
              <button
                onClick={() => setShowTrainPicker(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 active:scale-90 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mt-3 overflow-y-auto no-scrollbar">
              {INITIAL_TRAINS.map((train) => {
                const isSelected = selectedTrain.id === train.id;
                return (
                  <div
                    key={train.id}
                    onClick={() => {
                      sounds.tap();
                      setSelectedTrain(train);
                      setShowTrainPicker(false);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-[#008b3e] bg-emerald-50/50 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#008b3e] flex items-center justify-center shrink-0">
                        <Train className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          {train.trainNumber} {train.trainName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {train.route}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. Profile Drawer */}
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
