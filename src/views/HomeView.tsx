import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { bdt } from '@/lib/format';
import type { Profile } from '@/lib/supabase';
import {
  Bell,
  Briefcase,
  ChevronRight,
  Coins,
  Menu,
  Trophy,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import type { TabKey } from '@/components/BottomNav';

export function HomeView({
  go,
  userName,
  profile,
}: {
  go: (t: TabKey) => void;
  userName: string;
  profile: Profile | null;
}) {
  const { activeWork, wallet } = useAppStore();
  const [language, setLanguage] = useState<'BN' | 'EN'>('BN');
  const [menuOpen, setMenuOpen] = useState(false);
  const w = wallet();
  const rank = profile?.rank ?? 0;
  const coins = profile?.coins ?? w.coins;
  const hasActive = !!activeWork;

  return (
    <div className="min-h-screen bg-white">
      <header className="relative border-b border-slate-100 bg-white px-4 pb-4 pt-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-800 transition hover:bg-slate-100 active:scale-95"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={28} strokeWidth={2.2} /> : <Menu size={30} strokeWidth={2.2} />}
          </button>
          <img src="/assets/images/97428-removebg-preview.png" alt="ET work BD logo" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[18px] font-extrabold leading-tight tracking-tight text-slate-900">ET work BD</h1>
            <p className="truncate text-xs font-medium text-slate-500">{userName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLanguage((current) => current === 'BN' ? 'EN' : 'BN')}
              className="text-xs font-bold text-slate-800 transition active:scale-95"
              aria-label="Switch language"
            >
              <span className={language === 'BN' ? 'text-slate-900' : 'text-slate-400'}>BN</span>
              <span className="mx-0.5 text-slate-300">/</span>
              <span className={language === 'EN' ? 'text-slate-900' : 'text-slate-400'}>EN</span>
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="relative flex h-10 w-10 items-center justify-center text-slate-800 transition active:scale-95"
              aria-label="Notifications"
            >
              <Bell size={24} strokeWidth={1.9} />
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white">3</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="absolute left-5 right-5 top-[82px] z-20 rounded-2xl bg-white p-2 shadow-xl ring-1 ring-slate-200 animate-pop">
            <button type="button" onClick={() => { go('profile'); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <UserRound size={18} className="text-violet-700" /> View profile
            </button>
            <button type="button" onClick={() => { go('wallet'); setMenuOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Wallet size={18} className="text-violet-700" /> Open wallet
            </button>
          </div>
        )}
      </header>

      <main className="space-y-5 px-4 pb-6 pt-5">
        <section className="grid grid-cols-[1.08fr_.92fr] overflow-hidden rounded-[24px] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.09)] ring-1 ring-slate-200/80">
          <div className="flex min-h-[238px] flex-col justify-between rounded-[20px] bg-gradient-to-br from-[#5b32c4] to-[#3f208f] p-4 text-white shadow-lg shadow-violet-900/20">
            <div>
              <div className="mb-3 flex items-start gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Wallet size={19} strokeWidth={1.8} />
                </span>
                <p className="pt-0.5 text-sm font-bold leading-5 text-white/90">Current<br />Balance</p>
              </div>
              <p className="whitespace-nowrap text-[22px] font-extrabold tracking-tight">{bdt(w.balance)} <span className="text-xs font-semibold text-white/80">Taka</span></p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-300 text-amber-800 shadow-inner">
                <Coins size={21} />
              </span>
              <span className="text-base font-bold">{coins.toFixed(2)}</span>
              <span className="text-xs text-white/80">Coin</span>
            </div>
          </div>

          <div className="flex min-h-[238px] flex-col justify-between px-3 py-4">
            <div>
              <div className="flex items-center gap-3 text-slate-500">
                <UserRound size={25} strokeWidth={1.8} className="text-emerald-600" />
                <span className="text-sm font-semibold">Referral</span>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p><span className="text-xl font-bold text-slate-800">৳ 0</span> <span className="text-slate-500">Taka</span></p>
                <p><span className="text-xl font-bold text-slate-800">0</span> <span className="text-slate-500">Coin</span></p>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-3 text-slate-500">
                <Trophy size={25} strokeWidth={1.8} className="text-amber-500" />
                <span className="text-sm font-semibold">User Rank</span>
              </div>
              <p className="mt-1 text-2xl font-extrabold text-slate-900">{rank > 0 ? `#${rank}` : '#232'}</p>
              <button type="button" onClick={() => go('wallet')} className="mt-1 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">View leader</button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-slate-900">Your Work</h2>
          <button
            type="button"
            onClick={() => go('work')}
            className="flex w-full items-center justify-between rounded-[22px] bg-white p-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <span className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-[19px] bg-emerald-100 text-emerald-700">
                <Briefcase size={28} strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-xl font-bold text-slate-900">My Work</span>
                <span className="mt-1 block max-w-[170px] truncate text-sm text-slate-500">{hasActive ? 'You have a task in progress' : 'View & manage your tasks'}</span>
              </span>
            </span>
            <ChevronRight size={30} className="text-slate-500" />
          </button>
        </section>
      </main>
    </div>
  );
}
