import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORIES, SUB_TASKS } from '@/data/categories';
import type { Platform, JobLevel } from '@/types';
import { bdtPlain } from '@/lib/format';
import { CategoryIcon } from '@/components/CategoryIcon';
import { Toast } from '@/components/ui';
import { Check, Link2, Upload, Image as ImageIcon, X, Calculator, MessageSquare } from 'lucide-react';

export function CreateView() {
  const { createJob, jobCountByPlatform, settings, wallet, me } = useAppStore();
  const [platform, setPlatform] = useState<Platform>('Facebook');
  const [subTaskType, setSubTaskType] = useState(SUB_TASKS['Facebook'][0].label);
  const [jobTitle, setJobTitle] = useState('');
  const [rate, setRate] = useState(String(SUB_TASKS['Facebook'][0].rate));
  const [totalWorkers, setTotalWorkers] = useState('');
  const [pageName, setPageName] = useState('');
  const [pageLink, setPageLink] = useState('');
  const [level, setLevel] = useState<JobLevel>('Level 1');
  const [screenshot, setScreenshot] = useState<string>('');
  const [comments, setComments] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const onPlatform = (p: Platform) => {
    setPlatform(p);
    const first = SUB_TASKS[p][0];
    setSubTaskType(first.label);
    setRate(String(first.rate));
  };

  const onSubTask = (label: string) => {
    setSubTaskType(label);
    const found = SUB_TASKS[platform].find((s) => s.label === label);
    if (found) setRate(String(found.rate));
  };

  const onFile = (file: File | undefined, setter: (s: string) => void) => {
    if (!file) return setter('');
    const reader = new FileReader();
    reader.onload = () => setter(reader.result as string);
    reader.readAsDataURL(file);
  };

  const r = parseFloat(rate) || 0;
  const tw = parseInt(totalWorkers, 10) || 0;
  const subtotal = r * tw;
  const serviceCharge = subtotal * (settings.serviceChargePercent / 100);
  const totalCost = subtotal + serviceCharge;
  const myBalance = wallet().balance;

  const submit = () => {
    if (!jobTitle.trim() || r <= 0 || !pageName.trim()) {
      setToast({ msg: 'অনুগ্রহ করে সব প্রয়োজনীয় ঘর পূরণ করুন।', ok: false });
      return;
    }
    if (!screenshot) {
      setToast({ msg: 'অনুগ্রহ করে একটি নমুনা স্ক্রিনশট আপলোড করুন।', ok: false });
      return;
    }
    const commentLines = comments
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    const res = createJob({
      platform,
      subTaskType,
      jobTitle: jobTitle.trim(),
      rate: r,
      totalWorkers: tw,
      level,
      pageName: pageName.trim(),
      referenceScreenshot: screenshot,
      pageLink: pageLink.trim() || undefined,
      commentLines,
      instructions: [
        `সার্চ বক্সে নাম লিখে নির্দিষ্ট পেজ বা প্রোফাইলটি খুঁজুন: ${pageName.trim()}`,
        `বলা অনুযায়ী কাজটি সঠিক নিয়ম মেনে সম্পূর্ণ করুন: ${subTaskType}`,
        'কাজ শেষ করে একটি পরিষ্কার স্ক্রিনশট নিন',
      ],
    });
    setToast({ msg: res.message, ok: res.success });
    if (res.success) {
      setJobTitle(''); setRate(''); setTotalWorkers(''); setPageName(''); setPageLink(''); setScreenshot(''); setComments('');
    }
  };

  return (
    <div className="space-y-5 px-4 py-5">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">কাজ তৈরি করুন</h1>
        <p className="mt-1 text-sm text-slate-500">কর্মীদের জন্য কাজ পোস্ট করুন। খরচ আপনার ব্যালেন্স থেকে কেটে নেওয়া হবে।</p>
      </div>

      {/* Balance hint */}
      <div className="flex items-center justify-between rounded-2xl bg-violet-50 p-3.5 ring-1 ring-violet-200">
        <span className="text-sm font-medium text-violet-700">আপনার ব্যালেন্স</span>
        <span className="text-sm font-bold text-violet-800">৳ {bdtPlain(myBalance)}</span>
      </div>

      {/* Platform */}
      <div className="card">
        <label className="label">প্ল্যাটফর্ম ক্যাটাগরি</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.platform}
              onClick={() => onPlatform(c.platform)}
              className={`pill ${platform === c.platform ? 'bg-violet-600 text-white ring-violet-600' : 'bg-white text-slate-600 ring-slate-200'}`}
            >
              <CategoryIcon name={c.icon} className="h-4 w-4" />
              {c.platform}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {jobCountByPlatform(platform)} টি কাজ বর্তমানে {platform}-এ চলমান
        </p>
      </div>

      {/* Sub-task type */}
      <div className="card">
        <label className="label">সাব-টাস্ক টাইপ</label>
        <select value={subTaskType} onChange={(e) => onSubTask(e.target.value)} className="input">
          {SUB_TASKS[platform].map((s) => (
            <option key={s.label} value={s.label}>{s.label} (৳{s.rate.toFixed(2)}/work)</option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">সুপারিশকৃত রেট স্বয়ংক্রিয়ভাবে বসানো হয়েছে — আপনি চাইলে নিচে পরিবর্তন করতে পারেন।</p>
      </div>

      {/* Job details */}
      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">প্রতি কর্মীর পেমেন্ট (৳)</label>
            <input className="input" type="number" step="0.05" min="0" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="0.25" />
          </div>
          <div>
            <label className="label">মোট কতজন কর্মী প্রয়োজন (সর্বনিম্ন {settings.minWorkers} জন)</label>
            <input className="input" type="number" min={settings.minWorkers} value={totalWorkers} onChange={(e) => setTotalWorkers(e.target.value)} placeholder="১০০" />
          </div>
        </div>
        <div>
          <label className="label">যে লেভেলের কর্মী প্রয়োজন</label>
          <div className="flex gap-2">
            {(['Level 1', 'Level 2', 'Level 3'] as JobLevel[]).map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`pill flex-1 ${level === l ? 'bg-violet-600 text-white ring-violet-600' : 'bg-white text-slate-600 ring-slate-200'}`}
              >
                {l === 'Level 1' ? 'লেভেল ১' : l === 'Level 2' ? 'লেভেল ২' : 'লেভেল ৩'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">পেজ / প্রোফাইলের নাম</label>
          <input className="input" value={pageName} onChange={(e) => setPageName(e.target.value)} placeholder="যেমন: টেক্সট বক্স অনুযায়ী সার্চ নাম" />
        </div>
        <div>
          <label className="label flex items-center gap-1.5"><Link2 size={14} /> পেজ / ভিডিও লিংক (ঐচ্ছিক)</label>
          <input className="input" value={pageLink} onChange={(e) => setPageLink(e.target.value)} placeholder="https://facebook.com/..." />
        </div>
      </div>

      {/* Screenshot */}
      <div className="card">
        <label className="label">পোস্ট বা প্রোফাইলের নমুনা স্ক্রিনশট</label>
        <UploadBox value={screenshot} onChange={(f) => onFile(f, setScreenshot)} onClear={() => setScreenshot('')} label="স্ক্রিনশট আপলোড করতে এখানে ট্যাপ করুন" />
      </div>

      {/* Selective comment lines */}
      <div className="card">
        <label className="label flex items-center gap-1.5"><MessageSquare size={14} /> নির্দিষ্ট কমেন্টের লাইনসমূহ</label>
        <p className="mb-2 text-xs text-slate-500">প্রতি লাইনে একটি কমেন্ট লিখুন। কর্মীরা এখান থেকে একটি কমেন্ট ব্যবহার করবে।</p>
        <textarea
          className="input min-h-[100px] resize-y"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={'দারুণ পেজ!\nখুব তথ্যবহুল\nফলো করছি'}
        />
        {comments.trim() && (
          <p className="mt-2 text-xs text-slate-500">
            {comments.split('\n').filter((l) => l.trim()).length} টি কমেন্ট যোগ হয়েছে
          </p>
        )}
      </div>

      {/* Cost breakdown */}
      {r > 0 && tw > 0 && (
        <div className="card space-y-2.5 bg-violet-50/60 ring-violet-200">
          <p className="flex items-center gap-1.5 text-sm font-bold text-violet-800">
            <Calculator size={16} /> খরচের হিসাব
          </p>
          <Line label={`সাবটোটাল (${tw} × ৳${bdtPlain(r)})`} value={`৳ ${bdtPlain(subtotal)}`} />
          <Line label={`সার্ভিস চার্জ (${settings.serviceChargePercent}%)`} value={`৳ ${bdtPlain(serviceCharge)}`} />
          <div className="border-t border-violet-200 pt-2.5">
            <Line label="মোট খরচ" value={`৳ ${bdtPlain(totalCost)}`} bold />
          </div>
          <p className={`text-xs font-medium ${myBalance >= totalCost ? 'text-emerald-600' : 'text-rose-600'}`}>
            {myBalance >= totalCost
              ? `কেটে নেওয়ার পর ৳ ${bdtPlain(myBalance - totalCost)} অবশিষ্ট থাকবে`
              : `৳ ${bdtPlain(totalCost - myBalance)} ব্যালেন্স কম`}
          </p>
        </div>
      )}

      <button
        onClick={submit}
        disabled={r <= 0 || tw < settings.minWorkers || myBalance < totalCost}
        className="brand-btn w-full py-3 text-base"
      >
        <Check size={18} /> কাজটি পোস্ট করুন · ৳ {bdtPlain(totalCost)}
      </button>

      {toast && <Toast message={toast.msg} onClose={() => setToast(null)} tone={toast.ok ? 'success' : 'error'} />}
    </div>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-600">{label}</span>
      <span className={bold ? 'font-extrabold text-violet-800' : 'font-semibold text-slate-800'}>{value}</span>
    </div>
  );
}

export function UploadBox({
  value, onChange, onClear, label,
}: {
  value: string;
  onChange: (file: File | undefined) => void;
  onClear: () => void;
  label?: string;
}) {
  return (
    <label className="relative flex aspect-video w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-violet-400 hover:bg-violet-50/50">
      {value ? (
        <>
          <img src={value} alt="preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onClear(); }}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X size={15} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1.5 text-slate-400">
          {label ? <Upload size={22} /> : <ImageIcon size={26} />}
          <span className="text-xs font-medium">{label ?? 'স্ক্রিনশট আপলোড করতে এখানে ট্যাপ করুন'}</span>
        </div>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files?.[0])} />
    </label>
  );
}
