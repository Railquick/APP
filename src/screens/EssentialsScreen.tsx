import { useState, useEffect } from 'react';
import { useJourney } from '../state/journey';
import { useCart } from '../state/cart';
import { fetchProducts, createOrder, checkDeliverySupport } from '../services/shop';
import { Product, ProductCategory, OrderConfirmation } from '../types';
import { navigate } from '../router';
import { errorMessage } from '../services/api';
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  Train,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES: Array<{ id: ProductCategory | 'all'; label: string; icon: string }> = [
  { id: 'all', label: 'All Essentials', icon: '⚡' },
  { id: 'medicines', label: 'Medicines & First Aid', icon: '💊' },
  { id: 'hygiene', label: 'Personal Hygiene', icon: '🧼' },
  { id: 'electronics', label: 'Chargers & Cables', icon: '🔌' },
  { id: 'babycare', label: 'Baby Care', icon: '🍼' },
  { id: 'comfort', label: 'Comfort & Sleep', icon: '🧳' },
];

export function EssentialsScreen() {
  const journey = useJourney();
  const cart = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart & Checkout Drawer
  const [cartOpen, setCartOpen] = useState(false);

  // Delivery Form State (Pre-filled from verified journey and locked to NZM pilot hub)
  const [passengerName, setPassengerName] = useState(journey?.passengerName || 'Passenger');
  const [phone, setPhone] = useState('9876543210');
  const [coach, setCoach] = useState(journey?.defaultCoach || 'B4');
  const [seatBerth, setSeatBerth] = useState(journey?.defaultSeat || '21');
  const paymentMethod = 'PAY_ON_DELIVERY';
  const deliveryStation = 'NZM'; // Locked to Hazrat Nizamuddin for the pilot phase

  const [isSupportedStation, setIsSupportedStation] = useState(true);

  // Order submission state
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmation | null>(null);

  // Load products for Hazrat Nizamuddin hub
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProducts(selectedCategory, searchQuery, deliveryStation)
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setError('');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory, searchQuery, deliveryStation]);

  // Check delivery station availability
  useEffect(() => {
    checkDeliverySupport(deliveryStation)
      .then((res) => {
        setIsSupportedStation(res.supported);
        
      })
      .catch(() => undefined);
  }, [deliveryStation]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingOrder) return;

    if (!passengerName.trim()) {
      setOrderError('Please enter the passenger name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setOrderError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!coach.trim()) {
      setOrderError('Please enter your coach (e.g. B4, S3, A1).');
      return;
    }

    if (!seatBerth.trim()) {
      setOrderError('Please enter your seat or berth number.');
      return;
    }

    if (cart.items.length === 0) {
      setOrderError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setOrderError('');
    setSubmittingOrder(true);

    try {
      const order = await createOrder({
        userPhone: cleanPhone,
        passengerName: passengerName.trim(),
        pnr: journey?.pnrData?.pnr,
        trainNumber: journey?.trainNumber || '12424',
        trainName: journey?.trainName || 'Rajdhani Express',
        journeyDate: journey?.journeyDate || 'Today',
        boardingStation: journey?.boardingStation || 'New Delhi (NDLS)',
        destinationStation: 'Hazrat Nizamuddin (NZM)',
        deliveryStation: 'NZM',
        coach: coach.trim().toUpperCase(),
        seatBerth: seatBerth.trim(),
        paymentMethod: paymentMethod,
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });

      // Clear cart on successful order
      cart.clear();
      setConfirmedOrder(order);
      setCartOpen(false);
    } catch (err: any) {
      const status = err?.status;
      const msg = errorMessage(err);
      if (status === 429 || msg.toLowerCase().includes('capacity')) {
        setOrderError('Hazrat Nizamuddin delivery runners are currently at full capacity. Please retry in 5 minutes.');
      } else {
        setOrderError(msg);
      }
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <main className="min-h-dvh bg-gray-50/50 pb-24">
      {/* Top Bar with train context */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/journey')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            aria-label="Back to journey"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="text-center min-w-0 px-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Seat Delivery Active • NZM Hub
            </span>
            <h1 className="text-xs font-bold text-gray-900 leading-none truncate">
              {journey?.trainName || 'Rajdhani Express'} • Coach {coach || 'B4'}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-800"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cart.totals.totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-black text-white">
                {cart.totals.totalItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicines, chargers, wipes, baby care..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-2 pl-9 pr-4 text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>
      </header>

      {/* Categories Scroller */}
      <div className="sticky top-[95px] z-20 border-b border-gray-100 bg-white px-5 py-2.5 shadow-sm">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="p-4 sm:p-5 max-w-lg mx-auto">
        {loading ? (
          <div className="py-20 text-center">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
            <p className="mt-2 text-xs font-medium text-gray-500">Loading Hazrat Nizamuddin hub catalog...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-4 text-center text-xs text-red-700">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <ShoppingBag className="mx-auto h-8 w-8 mb-2 stroke-1" />
            <p className="text-sm font-medium text-gray-600">No essentials matched your search.</p>
            <p className="text-xs mt-1">Try another category or search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const inCart = cart.items.find((item) => item.product.id === product.id);
              const qty = inCart?.quantity || 0;
              const price = (product.price_paise / 100).toFixed(0);
              const mrp = (product.mrp_paise / 100).toFixed(0);

              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition duration-150"
                >
                  <div>
                    {/* Image & Badge */}
                    <div className="relative aspect-square w-full rounded-xl bg-gray-50 overflow-hidden mb-2.5">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                        loading="lazy"
                      />
                      {product.badge && (
                        <span className="absolute top-1.5 left-1.5 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">
                          {product.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      {product.unit}
                    </p>
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-2 mt-0.5 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>
                  </div>

                  {/* Price & Quantity Controls */}
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-50">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-extrabold text-gray-900">₹{price}</span>
                        {product.mrp_paise > product.price_paise && (
                          <span className="text-[10px] text-gray-400 line-through">₹{mrp}</span>
                        )}
                      </div>
                    </div>

                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => cart.add(product)}
                        className="flex items-center gap-1 rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition shadow-sm"
                      >
                        <Plus className="h-3 w-3 stroke-[3]" />
                        ADD
                      </button>
                    ) : (
                      <div className="flex items-center rounded-xl bg-emerald-700 text-white px-1.5 py-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => cart.updateQty(product.id, qty - 1)}
                          className="p-0.5 hover:opacity-80"
                        >
                          <Minus className="h-3 w-3 stroke-[3]" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.updateQty(product.id, qty + 1)}
                          className="p-0.5 hover:opacity-80"
                        >
                          <Plus className="h-3 w-3 stroke-[3]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.totals.totalItemCount > 0 && !cartOpen && (
        <div className="fixed inset-x-0 bottom-4 z-40 px-4">
          <div className="max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-emerald-800 p-3.5 text-white shadow-2xl hover:bg-emerald-900 active:scale-[0.99] transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 font-bold text-sm">
                  {cart.totals.totalItemCount}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold leading-tight">
                    Total: ₹{(cart.totals.totalPaise / 100).toFixed(0)}
                  </p>
                  <p className="text-[10px] text-emerald-200">
                    {cart.totals.deliveryFeePaise === 0
                      ? 'Free seat delivery at Hazrat Nizamuddin'
                      : `₹${(cart.totals.deliveryFeePaise / 100).toFixed(0)} delivery fee`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 px-3.5 py-2 rounded-xl">
                <span>View Cart & Berth</span>
                <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* CART & CHECKOUT DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-700" />
                <h2 className="text-base font-bold text-gray-900">Your Travel Essentials Cart</h2>
              </div>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                aria-label="Close cart"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Items List */}
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="h-12 w-12 rounded-lg object-cover bg-gray-50"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 max-w-[170px] truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          ₹{(item.product.price_paise / 100).toFixed(0)} × {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl bg-gray-100 px-2 py-1">
                        <button
                          type="button"
                          onClick={() => cart.updateQty(item.product.id, item.quantity - 1)}
                          className="text-gray-600 hover:text-black font-bold px-1"
                        >
                          -
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => cart.updateQty(item.product.id, item.quantity + 1)}
                          className="text-gray-600 hover:text-black font-bold px-1"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs font-extrabold text-gray-900 min-w-12 text-right">
                        ₹{((item.product.price_paise * item.quantity) / 100).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Context & Details Form */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Seat Delivery Details
                  </h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    NZM Pilot Phase
                  </span>
                </div>

                <div className="rounded-2xl border border-gray-200 p-3.5 bg-gray-50/50 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                    <div className="flex items-center gap-2">
                      <Train className="h-4 w-4 text-emerald-600" />
                      <span>{journey?.trainNumber || '12424'} - {journey?.trainName || 'Rajdhani Express'}</span>
                    </div>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      ON-SEAT
                    </span>
                  </div>

                  {/* Delivery Station - Locked to NZM */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase">
                      Delivery Station (Locked to Pilot Hub)
                    </label>
                    <div className="mt-1 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/80 px-3 py-2 text-xs font-bold text-emerald-950">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Hazrat Nizamuddin (NZM)</span>
                      </div>
                      <span className="rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                        Active Pilot Hub
                      </span>
                    </div>
                  </div>

                  {/* Coach & Seat */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase">Coach</label>
                      <input
                        type="text"
                        value={coach}
                        onChange={(e) => setCoach(e.target.value.toUpperCase())}
                        placeholder="e.g. B4"
                        required
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold uppercase text-gray-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase">Seat / Berth</label>
                      <input
                        type="text"
                        value={seatBerth}
                        onChange={(e) => setSeatBerth(e.target.value)}
                        placeholder="e.g. 21"
                        required
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Passenger Name & Phone */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase">Passenger Name</label>
                      <input
                        type="text"
                        value={passengerName}
                        onChange={(e) => setPassengerName(e.target.value)}
                        placeholder="Name on ticket"
                        required
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase">Mobile for Delivery</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit phone"
                        required
                        className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase">Payment Method</label>
                    <div className="mt-1 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800">
                      <span className="font-bold text-gray-900">Pay on Delivery</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Cash / UPI on Berth
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hub Notice */}
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Hazrat Nizamuddin (NZM) hub is active for in-train seat delivery.</span>
                </div>

                {/* Order Bill Summary */}
                <div className="rounded-2xl border border-gray-200 p-4 space-y-2 bg-white">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Items Subtotal</span>
                    <span>₹{(cart.totals.subtotalPaise / 100).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Train Berth Delivery Charge</span>
                    <span>
                      {cart.totals.deliveryFeePaise === 0 ? (
                        <strong className="text-emerald-700">FREE</strong>
                      ) : (
                        `₹${(cart.totals.deliveryFeePaise / 100).toFixed(0)}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-2 flex justify-between text-sm font-extrabold text-gray-900">
                    <span>Total To Pay</span>
                    <span>₹{(cart.totals.totalPaise / 100).toFixed(0)}</span>
                  </div>
                </div>

                {orderError && (
                  <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold animate-in fade-in">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                    <span>{orderError}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingOrder || !isSupportedStation}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-700 disabled:opacity-50 transition"
                  >
                    {submittingOrder ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Placing Order for NZM Hub...
                      </span>
                    ) : (
                      <>
                        <span>Confirm Order (₹{(cart.totals.totalPaise / 100).toFixed(0)})</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <p className="mt-1.5 text-center text-[10px] text-gray-400">
                    Hazrat Nizamuddin (NZM) Pilot • Pay on Delivery directly at your seat
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ORDER CONFIRMATION MODAL */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 mb-3">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Placed - Delivery at Hazrat Nizamuddin</span>
            </div>

            <h2 className="mt-3 text-lg font-black text-gray-900">
              Order ID: #{confirmedOrder.orderId || confirmedOrder.orderRef}
            </h2>

            {/* 4-Digit Delivery OTP Card */}
            <div className="my-4 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 to-emerald-100/40 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                4-Digit Delivery OTP
              </p>
              <p className="mt-1 font-mono text-3xl font-black tracking-[0.25em] text-emerald-950">
                {confirmedOrder.deliveryOtp ||
                  confirmedOrder.orderRef?.replace(/\D/g, '').slice(-4) ||
                  '1234'}
              </p>
              <p className="mt-1.5 text-[11px] font-medium text-emerald-700">
                Show this OTP to the delivery runner at your seat when your order arrives.
              </p>
            </div>

            {/* Details breakdown */}
            <div className="rounded-2xl bg-gray-50 p-4 text-left text-xs space-y-2.5 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Seat & Coach:</span>
                <span className="font-extrabold text-gray-900">
                  Coach {confirmedOrder.coach}, Seat {confirmedOrder.seatBerth}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Train:</span>
                <span className="font-bold text-gray-900">
                  {confirmedOrder.trainName} (#{confirmedOrder.trainNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Station:</span>
                <span className="font-bold text-emerald-800">Hazrat Nizamuddin (NZM)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Passenger:</span>
                <span className="font-bold text-gray-900">{confirmedOrder.passengerName}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                <span>Total Payable:</span>
                <span>₹{(confirmedOrder.totalPaise / 100).toFixed(0)} (Pay on Delivery)</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  navigate('/');
                }}
                className="flex-1 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition active:scale-[0.99]"
              >
                Back to Home
              </button>
              <button
                type="button"
                onClick={() => setConfirmedOrder(null)}
                className="rounded-2xl border border-gray-200 px-4 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
