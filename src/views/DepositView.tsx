import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { bdt, timeAgo } from '@/lib/format';
import type { DepositMethod } from '@/types';
import { CopyButton, Toast } from '@/components/ui';
import { UploadBox } from '@/views/CreateView';
import { cn } from '@/lib/cn';
import { copyText } from '@/components/ui';
import { BkashLogo, NagadLogo, RocketLogo } from '@/components/BrandLogos';
import {
  ChevronLeft, PlayCircle, History, Check, Clock, X, ShieldCheck,
} from 'lucide-react';
import type { JSX } from 'react';

const RECEIVE_NUMBER = '01322490870';

const METHODS: {
  name: DepositMethod;
  Logo: (props: { className?: string }) => JSX.Element;
}[] = [
  { name: 'bKash Personal', Logo: BkashLogo },
  { name: 'Nagad Personal', Logo: NagadLogo },
  { name: 'Rocket Personal', Logo: RocketLogo },
];

const QUICK = [50, 100, 500, 1000, 2000, 5000];

export function DepositView({ onBack }: { onBack: () => void }) {
  const { requestDeposit, deposits } = useAppStore();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<DepositMethod>('bKash Personal');
  const [sender, setSender] = useState('');
  const [trxId, setTrxId] = useState('');
  const [screenshot, setScreenshot] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [numCopied, setNumCopied] = useState(false);

  const active = METHODS.find((m) => m.name === method)!;

  const copyNumber = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await copyText(RECEIVE_NUMBER);
    if (ok) {
      setNumCopied(true);
      setToast('নম্বর কপি হয়েছে!');
      setTimeout(() => setNumCopied(false), 1500);
    } else {
      setToast('কপি করা যায়নি। ম্যানুয়ালি কপি করুন।');
    }
  };

  const submit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setToast('সঠিক টাকার পরিমাণ লিখুন।');
    if (!sender.trim()) return setToast('যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন।');
    if (!trxId.trim()) return setToast('ট্রানজেকশন আইডি (TrxID) লিখুন।');
    if (!screenshot) return setToast('পেমেন্টের স্ক্রিনশট আপলোড করুন।');
    requestDeposit({
      amount: amt,
      method,
      senderNumber: sender.trim(),
      trxId: trxId.trim(),
      screenshot,
    });
    setAmount(''); setSender(''); setTrxId(''); setScreenshot('');
    setToast('ডিপোজিট রিকোয়েস্ট পাঠানো হয়েছে! অ্যাডমিন অনুমোদনের অপেক্ষায়।');
  };

  return (
    <div className="min-h-full">
      <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-md">
        <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 active:scale-95">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-slate-800">টাকা জমা দিন (ডিপোজিট)</h1>
        <button
          onClick={() => setShowHistory(true)}
          className="ml-auto flex items-center gap-1.5 rounded-lg bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700"
        >
          <History size={14} /> হিস্টোরি
        </button>
      </div>

      <div className="space-y-4 px-4 py-4">
        {/* Tutorial card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <PlayCircle size={36} className="text-violet-400" />
            <div className="flex-1">
              <p className="text-sm font-bold">কিভাবে ডিপোজিট করবেন</p>
              <p className="text-xs text-slate-300">২ মিনিটের টিউটোরিয়াল ভিডিও দেখুন</p>
            </div>
            <span className="badge bg-violet-500/30 text-violet-200">২:০০</span>
          </div>
        </div>

        {/* Amount */}
        <div className="card">
          <label className="label">টাকার পরিমাণ (BDT)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">৳</span>
            <input
              className="input pl-9 text-lg font-bold"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className={cn(
                  'pill',
                  amount === String(q) ? 'bg-violet-600 text-white ring-violet-600' : 'bg-violet-50 text-violet-700 ring-violet-200'
                )}
              >
                ৳{q}
              </button>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div className="card">
          <label className="label">পেমেন্ট মেথড</label>
          <div className="space-y-2">
            {METHODS.map((m) => (
              <button
                key={m.name}
                onClick={() => setMethod(m.name)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border p-3 transition',
                  method === m.name ? 'border-violet-500 bg-violet-50 ring-1 ring-violet-200' : 'border-slate-200 bg-white'
                )}
              >
                <m.Logo className="h-9 w-9 shrink-0 rounded-lg" />
                <span className="flex-1 text-left text-sm font-semibold text-slate-800">{m.name}</span>
                {method === m.name && <Check size={18} className="text-violet-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Deposit form */}
        <div className="card space-y-4">
          <p className="text-sm font-bold text-slate-800">পেমেন্টের বিবরণ</p>

          <div>
            <label className="label">আমাদের পার্সোনাল নম্বর ({RECEIVE_NUMBER})</label>
            <button
              type="button"
              onClick={copyNumber}
              className={cn(
                'flex w-full items-center justify-between gap-2 rounded-xl px-3.5 py-3 transition active:scale-[0.99]',
                numCopied ? 'bg-emerald-50 ring-1 ring-emerald-300' : 'bg-slate-100 hover:bg-slate-200/80'
              )}
              aria-label="Tap to copy number"
            >
              <span className="flex items-center gap-2">
                <active.Logo className="h-6 w-6 rounded-md" />
                <span className="font-mono text-sm font-semibold text-slate-800 select-none">{RECEIVE_NUMBER}</span>
              </span>
              <CopyButton text={RECEIVE_NUMBER} label={numCopied ? 'Copied!' : 'কপি'} />
            </button>
            <p className="mt-1.5 text-xs text-slate-500">
              নম্বরে ট্যাপ করে বা "কপি" বাটনে চাপ দিয়ে কপি করুন। তারপর টাকা পাঠিয়ে TrxID ও স্ক্রিনশট নিচে দিন।
            </p>
          </div>

          <div>
            <label className="label">যে নম্বর থেকে টাকা পাঠিয়েছেন (সেন্ডার নম্বর)</label>
            <input className="input" value={sender} onChange={(e) => setSender(e.target.value)} placeholder="01XXXXXXXXX" />
          </div>

          <div>
            <label className="label">ট্রানজেকশন আইডি (TrxID)</label>
            <input className="input" value={trxId} onChange={(e) => setTrxId(e.target.value)} placeholder="যেমন: 8AB12CD34E" />
          </div>

          <div>
            <label className="label">পেমেন্টের স্ক্রিনশট আপলোড করুন</label>
            <UploadBox
              value={screenshot}
              onChange={(f) => {
                if (!f) return setScreenshot('');
                const r = new FileReader();
                r.onload = () => setScreenshot(r.result as string);
                r.readAsDataURL(f);
              }}
              onClear={() => setScreenshot('')}
              label="পেমেন্টের স্ক্রিনশট আপলোড করুন"
            />
          </div>
        </div>

        <button onClick={submit} className="brand-btn w-full py-3 text-base">
          <ShieldCheck size={18} /> ডিপোজিট রিকোয়েস্ট পাঠান
        </button>
      </div>

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowHistory(false)}>
          <div className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-t-3xl bg-white animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-base font-bold text-slate-800">আমার ডিপোজিট হিস্টোরি</h2>
              <button onClick={() => setShowHistory(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
              {deposits.length === 0 && (
                <p className="py-10 text-center text-sm text-slate-400">এখনো কোনো ডিপোজিট রিকোয়েস্ট নেই।</p>
              )}
              {deposits.map((d) => (
                <div key={d.id} className="rounded-2xl bg-slate-50 p-3.5 ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{bdt(d.amount)}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{d.method} · TrxID: {d.trxId}</p>
                  <p className="text-xs text-slate-400">{timeAgo(d.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} tone={toast.includes('যায়নি') ? 'error' : 'success'} />}
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  if (status === 'approved') return <span className="badge bg-emerald-100 text-emerald-700"><Check size={11} /> অনুমোদিত</span>;
  if (status === 'rejected') return <span className="badge bg-rose-100 text-rose-700"><X size={11} /> বাতিল</span>;
  return <span className="badge bg-amber-100 text-amber-700"><Clock size={11} /> অপেক্ষমাণ</span>;
}
