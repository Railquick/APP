import React from 'react';

interface FloatingProduct {
  id: string;
  name: string;
  customVisual: React.ReactNode;
  animationClass: string;
  delay?: string;
}

export const FloatingProductsGrid: React.FC = () => {
  const products: FloatingProduct[] = [
    // Row 1
    {
      id: 'banana',
      name: 'Fresh Bananas',
      animationClass: 'animate-float-1',
      customVisual: (
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Bananas Bunch SVG illustration */}
          <svg viewBox="0 0 64 64" className="w-11 h-11 filter drop-shadow-md">
            <path
              d="M12 40C16 48 30 52 46 44C50 42 54 36 52 30C50 24 40 22 34 26C24 30 16 36 12 40Z"
              fill="#FACC15"
            />
            <path
              d="M14 36C20 44 34 46 48 38C52 36 55 30 53 26C49 22 41 22 34 26C26 30 18 34 14 36Z"
              fill="#FDE047"
            />
            <path
              d="M16 32C22 38 34 40 46 34C50 32 52 28 50 24C46 20 38 22 32 26C26 30 20 31 16 32Z"
              fill="#FEF08A"
            />
            {/* Banana crown stem */}
            <path d="M12 40L9 42C8 42 8 40 9 39L14 34" stroke="#65A30D" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M48 40C46 44 38 46 30 46" stroke="#CA8A04" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
      ),
    },
    {
      id: 'pampers',
      name: 'Pampers Diapers',
      animationClass: 'animate-float-2',
      customVisual: (
        <div className="relative w-12 h-12 bg-gradient-to-br from-[#00A8B5] to-[#00828C] rounded-md p-1 shadow-sm flex flex-col justify-between overflow-hidden">
          {/* Yellow badge */}
          <div className="w-4 h-4 rounded-full bg-yellow-400 absolute -top-1 -right-1 flex items-center justify-center text-[7px] font-bold text-amber-900">
            ★
          </div>
          <div className="text-white text-[9px] font-black tracking-tight leading-tight">
            Pampers
          </div>
          <div className="text-[6px] text-teal-100 font-semibold">happy pants</div>
          <div className="bg-yellow-300 text-teal-950 font-black text-[6px] rounded px-1 py-0.5 text-center mt-auto">
            No.1
          </div>
        </div>
      ),
    },
    {
      id: 'dairy-milk',
      name: 'Dairy Milk Silk',
      animationClass: 'animate-float-3',
      customVisual: (
        <div className="relative w-9 h-13 bg-gradient-to-b from-[#2E1A47] via-[#4A154B] to-[#7B1842] rounded-sm shadow-md p-1 flex flex-col items-center justify-between border-t border-purple-300/40">
          <div className="text-[6px] text-amber-300 font-serif">Cadbury</div>
          <div className="w-5 h-5 rounded-full border border-amber-300/70 flex items-center justify-center">
            <span className="text-amber-300 font-serif font-black text-[9px]">S</span>
          </div>
          <div className="text-[5.5px] tracking-wider text-amber-200 font-bold uppercase">SILK</div>
          <div className="text-[4.5px] text-amber-300/80">HAZELNUT</div>
        </div>
      ),
    },
    {
      id: 'perfume',
      name: 'Luxury Fragrance',
      animationClass: 'animate-float-1',
      customVisual: (
        <div className="relative w-9 h-12 bg-black rounded shadow-md flex flex-col overflow-hidden border border-neutral-700">
          <div className="h-4 bg-gradient-to-r from-pink-500 to-rose-400 p-0.5">
            <div className="w-full h-full border border-white/40 rounded-sm"></div>
          </div>
          <div className="flex-1 bg-neutral-900 p-1 flex flex-col justify-center items-center">
            <div className="text-[5px] text-amber-200 uppercase font-mono tracking-widest text-center">
              PARFUM
            </div>
            <div className="w-4 h-[1px] bg-amber-400/60 my-0.5"></div>
            <div className="text-[4px] text-neutral-400">EAU DE</div>
          </div>
        </div>
      ),
    },

    // Row 2
    {
      id: 'nescafe',
      name: 'Nescafé Gold',
      animationClass: 'animate-float-2',
      customVisual: (
        <div className="relative w-8 h-12 flex flex-col items-center">
          {/* Gold lid */}
          <div className="w-6 h-2.5 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded-t-sm shadow-xs"></div>
          {/* Glass jar */}
          <div className="w-7 h-9 bg-gradient-to-b from-amber-950 via-[#3a1b0d] to-[#241006] rounded-b-md shadow-sm border border-amber-700/50 p-0.5 flex flex-col items-center justify-center">
            <div className="bg-[#b31920] px-1 py-0.5 rounded text-[5px] text-white font-black tracking-tight">
              NESCAFÉ
            </div>
            <div className="text-[4.5px] text-yellow-300 font-bold mt-0.5">GOLD</div>
          </div>
        </div>
      ),
    },
    {
      id: 'cutlery',
      name: 'Eco Cutlery',
      animationClass: 'animate-float-3',
      customVisual: (
        <div className="relative w-11 h-11 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-10 h-10">
            {/* Fan of wooden spoons */}
            <path d="M12 12C12 8 16 7 18 10C19 12 18 16 16 19L20 34" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 9C19 5 23 4 25 8C26 10 24 14 23 18L21 35" stroke="#a16207" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M28 13C28 9 32 8 33 12C34 14 31 18 29 20L22 34" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
            {/* Spoon heads */}
            <ellipse cx="15" cy="11" rx="3.5" ry="4" fill="#a16207" />
            <ellipse cx="22" cy="8" rx="3.5" ry="4" fill="#92400e" />
            <ellipse cx="29" cy="12" rx="3.5" ry="4" fill="#854d0e" />
          </svg>
        </div>
      ),
    },
    {
      id: 'icecream',
      name: 'Havmor Vanilla',
      animationClass: 'animate-float-1',
      customVisual: (
        <div className="relative w-11 h-12 flex flex-col items-center">
          {/* Tub Rim */}
          <div className="w-10 h-2 bg-[#0284c7] rounded-t-sm border-b border-sky-600"></div>
          {/* Ice Cream Tub Body */}
          <div className="w-9 h-10 bg-gradient-to-b from-[#38bdf8] to-[#0284c7] rounded-b-md shadow-sm p-1 flex flex-col items-center justify-between text-center">
            {/* Red heart logo */}
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[5px]">
              ♥
            </div>
            <div className="leading-tight">
              <div className="text-[5.5px] text-white font-extrabold uppercase tracking-tight">
                SHAMELESS
              </div>
              <div className="text-[6.5px] text-yellow-200 font-black">
                VANILLA
              </div>
            </div>
            <div className="text-[4px] text-sky-100">100% DAIRY</div>
          </div>
        </div>
      ),
    },
    {
      id: 'dabur',
      name: 'Herbal Elixir',
      animationClass: 'animate-float-2',
      customVisual: (
        <div className="relative w-7 h-12 flex flex-col items-center">
          {/* Cap */}
          <div className="w-3.5 h-2 bg-neutral-800 rounded-t-xs"></div>
          {/* Bottle Neck */}
          <div className="w-2.5 h-1.5 bg-amber-900/90"></div>
          {/* Amber Bottle Body */}
          <div className="w-7 h-8.5 bg-gradient-to-r from-amber-950 via-amber-800 to-amber-950 rounded-b-sm shadow-sm p-0.5 flex flex-col items-center justify-center">
            <div className="w-5 h-5 bg-[#365314] rounded-xs p-0.5 flex flex-col items-center justify-center text-center">
              <div className="text-[5px] text-yellow-300 font-bold leading-none">डाबर</div>
              <div className="text-[4px] text-white leading-none mt-0.5">तेल</div>
            </div>
          </div>
        </div>
      ),
    },

    // Row 3
    {
      id: 'coke',
      name: 'Coca Cola Can',
      animationClass: 'animate-float-3',
      customVisual: (
        <div className="relative w-7 h-12 flex flex-col items-center">
          {/* Silver Can Top */}
          <div className="w-6 h-1.5 bg-gradient-to-r from-slate-300 via-white to-slate-400 rounded-t-sm"></div>
          {/* Red Can Body */}
          <div className="w-6.5 h-10.5 bg-gradient-to-r from-[#ba131a] via-[#e61b23] to-[#990d13] rounded-b-xs shadow-md p-0.5 flex flex-col items-center justify-center">
            <div className="text-white font-serif italic font-black text-[7px] tracking-tighter transform -rotate-90">
              Coca-Cola
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'biscuits',
      name: 'Biscuits Duo',
      animationClass: 'animate-float-1',
      customVisual: (
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Little hearts (orange/red packet) */}
          <div className="w-7 h-10 bg-gradient-to-b from-amber-500 to-red-500 rounded-xs shadow-sm p-0.5 flex flex-col items-center justify-center transform -rotate-6 z-0">
            <div className="text-[5px] text-white font-black leading-tight text-center">
              LITTLE<br/>HEARTS
            </div>
            <div className="text-red-200 text-[6px]">♥</div>
          </div>
          {/* Jim Jam (purple packet overlap) */}
          <div className="w-7 h-10 bg-gradient-to-b from-purple-700 to-indigo-900 rounded-xs shadow-md p-0.5 flex flex-col items-center justify-center transform rotate-6 -ml-3 z-10 border border-white/20">
            <div className="text-[5.5px] text-yellow-300 font-black leading-tight text-center">
              JIMJAM
            </div>
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white/60 my-0.5"></div>
          </div>
        </div>
      ),
    },
    {
      id: 'lays',
      name: "Lay's Chips",
      animationClass: 'animate-float-2',
      customVisual: (
        <div className="relative w-9 h-12 bg-gradient-to-b from-[#eab308] via-[#f97316] to-[#ea580c] rounded-xs shadow-md p-1 flex flex-col items-center justify-between border-t-2 border-b-2 border-amber-300/40">
          <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-yellow-300 flex items-center justify-center shadow-xs">
            <span className="text-yellow-200 font-sans italic font-black text-[6.5px]">
              Lay's
            </span>
          </div>
          <div className="text-[5px] text-white font-bold tracking-tight">Classic</div>
          <div className="w-4 h-2 bg-yellow-200/90 rounded-full shadow-inner"></div>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full px-2 pt-2 pb-1">
      {/* 4-column responsive grid matching the design mockup */}
      <div className="grid grid-cols-4 gap-2.5 max-w-[360px] mx-auto items-center justify-items-center">
        {products.map((item) => (
          <div
            key={item.id}
            className={`w-[72px] h-[72px] sm:w-[76px] sm:h-[76px] bg-[#f4f5f7] rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-300 hover:scale-105 active:scale-95 cursor-pointer ${item.animationClass}`}
            title={item.name}
          >
            {item.customVisual}
          </div>
        ))}

        {/* 12th card placeholder or promo tile to balance grid */}
        <div className="w-[72px] h-[72px] sm:w-[76px] sm:h-[76px] bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-2xl border border-emerald-100/60 flex flex-col items-center justify-center p-1.5 text-center shadow-xs animate-float-3">
          <span className="text-base">⚡</span>
          <span className="text-[8px] font-bold text-emerald-800 leading-tight">10 MIN</span>
          <span className="text-[7px] text-emerald-600">to Coach</span>
        </div>
      </div>
    </div>
  );
};
