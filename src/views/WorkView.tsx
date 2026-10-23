import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { CATEGORIES, SUB_TASKS } from '@/data/categories';
import type { Job, Platform } from '@/types';
import { bdt, timeAgo } from '@/lib/format';
import { CategoryIcon } from '@/components/CategoryIcon';
import { UploadBox } from '@/views/CreateView';
import { CopyButton, Toast } from '@/components/ui';
import { cn } from '@/lib/cn';
import { TaskInstructions } from '@/components/TaskInstructions';
import {
  Zap, ChevronRight, ChevronLeft, Lock, Check, AlertTriangle,
  Clock, BadgeCheck, X, Upload,
} from 'lucide-react';

type Screen =
  | { name: 'category' }
  | { name: 'subtask'; platform: Platform }
  | { name: 'feed'; platform: Platform; subTask: string }
  | { name: 'details'; job: Job; platform: Platform; subTask: string }
  | { name: 'submit'; job: Job; platform: Platform; subTask: string }
  | { name: 'result'; job: Job; platform: Platform; subTask: string; success: boolean; message: string };

export function WorkView() {
  const { jobs, jobCountByPlatform, activeWork } = useAppStore();
  const [screen, setScreen] = useState<Screen>({ name: 'category' });

  const go = (s: Screen) => setScreen(s);
  const back = () => {
    setScreen((prev) => {
      if (prev.name === 'subtask') return { name: 'category' };
      if (prev.name === 'feed') return { name: 'subtask', platform: prev.platform };
      if (prev.name === 'details') return { name: 'feed', platform: prev.platform, subTask: prev.subTask };
      if (prev.name === 'submit') return { name: 'details', job: prev.job, platform: prev.platform, subTask: prev.subTask };
      if (prev.name === 'result') return { name: 'feed', platform: prev.platform, subTask: prev.subTask };
      return { name: 'category' };
    });
  };

  return (
    <div className="min-h-full">
      {screen.name !== 'category' && (
        <Header
          title={titleFor(screen)}
          onBack={back}
        />
      )}
      {screen.name === 'category' && (
        <CategoryScreen jobs={jobs} jobCountByPlatform={jobCountByPlatform} onPick={(p) => go({ name: 'subtask', platform: p })} />
      )}
      {screen.name === 'subtask' && (
        <SubTaskScreen platform={screen.platform} jobs={jobs} onPick={(s) => go({ name: 'feed', platform: screen.platform, subTask: s })} />
      )}
      {screen.name === 'feed' && (
        <FeedScreen jobs={jobs.filter((j) => j.platform === screen.platform && j.subTaskType === screen.subTask)} onPick={(job) => go({ name: 'details', job, platform: screen.platform, subTask: screen.subTask })} />
      )}
      {screen.name === 'details' && (
        <DetailsScreen job={screen.job} onAccept={() => go({ name: 'submit', job: screen.job, platform: screen.platform, subTask: screen.subTask })} hasActive={!!activeWork} />
      )}
      {screen.name === 'submit' && (
        <SubmitScreen job={screen.job} onSubmit={(ok, msg) => go({ name: 'result', job: screen.job, platform: screen.platform, subTask: screen.subTask, success: ok, message: msg })} />
      )}
      {screen.name === 'result' && (
        <ResultScreen success={screen.success} message={screen.message} onDone={() => go({ name: 'category' })} />
      )}
    </div>
  );
}

function titleFor(s: Screen): string {
  if (s.name === 'subtask') return s.platform;
  if (s.name === 'feed') return s.subTask;
  if (s.name === 'details') return 'কাজের বিবরণ';
  if (s.name === 'submit') return 'কাজ জমা দিন';
  if (s.name === 'result') return 'যাচাইয়ের ফলাফল';
  return 'কাজ';
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-md">
      <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 active:scale-95">
        <ChevronLeft size={20} />
      </button>
      <h1 className="truncate text-base font-bold text-slate-800">{title}</h1>
    </div>
  );
}

// ---- Category Screen ----
function CategoryScreen({
  jobs, jobCountByPlatform, onPick,
}: {
  jobs: Job[];
  jobCountByPlatform: (p: string) => number;
  onPick: (p: Platform) => void;
}) {
  const total = jobs.filter((j) => j.availableSlots > 0).length;
  return (
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-slate-900">কাজ</h1>
        <p className="mt-1 text-sm text-slate-500">একটি প্ল্যাটফর্ম বেছে নিন এবং আয় শুরু করুন।</p>
      </div>
      {/* Instant work banner */}
      <div className="mb-5 flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 p-4 text-white shadow-md">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 pulse-ring">
          <Zap size={22} />
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold">ইনস্ট্যান্ট কাজ</p>
          <p className="text-xs text-white/90">এখনই {total} টি কাজ পাওয়া যাচ্ছে</p>
        </div>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map((c) => {
          const count = jobCountByPlatform(c.platform);
          return (
            <button
              key={c.platform}
              onClick={() => onPick(c.platform)}
              disabled={count === 0}
              className={cn(
                'group flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left ring-1 ring-slate-200/70 shadow-sm transition active:scale-[0.99]',
                count === 0 && 'opacity-60'
              )}
            >
              <div className={cn('flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md', c.color)}>
                <CategoryIcon name={c.icon} className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{c.platform} কাজ</p>
                <p className={cn('text-sm font-semibold', count > 0 ? 'text-emerald-600' : 'text-slate-400')}>
                  {count > 0 ? `${count} টি কাজ পাওয়া যাচ্ছে` : 'কোনো কাজ নেই'}
                </p>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:text-slate-400" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Sub-Task Screen ----
function SubTaskScreen({ platform, jobs, onPick }: { platform: Platform; jobs: Job[]; onPick: (s: string) => void }) {
  const subs = SUB_TASKS[platform];
  return (
    <div className="px-4 py-4">
      <p className="mb-3 text-sm text-slate-500">একটি টাস্ক টাইপ নির্বাচন করুন:</p>
      <div className="space-y-2.5">
        {subs.map((s) => {
          const match = jobs.find((j) => j.subTaskType === s.label && j.availableSlots > 0);
          const bestRate = match ? bdt(match.rate) : `৳${s.rate.toFixed(2)}`;
          return (
            <button
              key={s.label}
              onClick={() => onPick(s.label)}
              className="flex w-full items-center justify-between rounded-2xl bg-white p-4 text-left ring-1 ring-slate-200/70 shadow-sm transition active:scale-[0.99]"
            >
              <span className="text-sm font-semibold text-slate-800">{s.label}</span>
              {match ? (
                <span className="badge bg-emerald-100 text-emerald-700">{bestRate}</span>
              ) : (
                <span className="badge bg-slate-100 text-slate-500">৳{s.rate.toFixed(2)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---- Feed Screen ----
function FeedScreen({ jobs, onPick }: { jobs: Job[]; onPick: (j: Job) => void }) {
  if (jobs.length === 0) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-sm text-slate-500">এই ক্যাটাগরিতে এখনো কোনো কাজ পোস্ট করা হয়নি।</p>
        <p className="mt-1 text-xs text-slate-400">তৈরি করুন ট্যাব থেকে একটি কাজ তৈরি করে দেখুন।</p>
      </div>
    );
  }
  return (
    <div className="space-y-3 px-4 py-4">
      <p className="text-sm text-slate-500">{jobs.length} টি কাজ পাওয়া যাচ্ছে</p>
      {jobs.map((j) => (
        <button
          key={j.id}
          onClick={() => onPick(j)}
          disabled={j.locked || j.availableSlots <= 0}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl bg-white p-3.5 text-left ring-1 ring-slate-200/70 shadow-sm transition active:scale-[0.99]',
            (j.locked || j.availableSlots <= 0) && 'opacity-70'
          )}
        >
          <img src={j.employerThumbnail} alt="" className="h-12 w-12 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-800">{j.jobTitle}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className="badge bg-slate-100 text-slate-600">{j.availableSlots} স্লট খালি</span>
              <span className="badge bg-violet-100 text-violet-700">{j.level}</span>
              {j.locked && (
                <span className="badge bg-slate-200 text-slate-500">
                  <Lock size={11} /> লক করা
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold text-emerald-600">{bdt(j.rate)}</p>
            <p className="text-[10px] text-slate-400">{timeAgo(j.createdAt)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ---- Details Screen ----
function DetailsScreen({ job, onAccept, hasActive }: { job: Job; onAccept: () => void; hasActive: boolean }) {
  return (
    <div className="px-4 py-4">
      {/* timer banner */}
      <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-amber-800 ring-1 ring-amber-200">
        <Clock size={18} className="mt-0.5 shrink-0" />
        <p className="text-xs font-medium leading-relaxed">
          সময়সীমা: কাজটি গ্রহণ করার পর ১০ মিনিটের মধ্যে জমা দিতে হবে।
        </p>
      </div>

      <div className="card space-y-4">
        {/* Work ID */}
        <Row label="কাজের আইডি">
          <span className="font-mono text-sm font-semibold text-slate-800">{job.workId}</span>
          <CopyButton text={job.workId} label="কপি" />
        </Row>
        <Row label="পেজের নাম">
          <span className="text-sm font-semibold text-slate-800">{job.pageName}</span>
          <CopyButton text={job.pageName} label="কপি" />
        </Row>
        <Row label="পুরস্কার">
          <span className="font-bold text-emerald-600">{bdt(job.rate)}</span>
        </Row>
        <Row label="স্লট">
          <span className="text-sm font-semibold text-slate-700">{job.availableSlots} / {job.totalWorkers}</span>
        </Row>
        <Row label="লেভেল">
          <span className="badge bg-violet-100 text-violet-700">{job.level}</span>
        </Row>
        <Row label="কর্মীদাতা">
          <div className="flex items-center gap-2">
            <img src={job.employerThumbnail} alt="" className="h-6 w-6 rounded-full" />
            <span className="text-sm text-slate-700">{job.employerName}</span>
          </div>
        </Row>
      </div>

      {/* Reference screenshot */}
      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-slate-700">কর্মীদাতার নমুনা স্ক্রিনশট</p>
        <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
          <img src={job.referenceScreenshot} alt="reference" className="w-full" />
        </div>
        {job.pageLink && (
          <a
            href={job.pageLink}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-violet-700"
          >
            রেফারেন্স পেজ খুলুন <ChevronRight size={14} />
          </a>
        )}
      </div>

      <button
        onClick={onAccept}
        disabled={job.locked || job.availableSlots <= 0 || hasActive}
        className="brand-btn mt-5 w-full py-3 text-base"
      >
        {job.locked ? <><Lock size={18} /> লক করা</> : hasActive ? 'চলমান কাজ শেষ করুন' : <><Check size={18} /> কাজটি গ্রহণ করুন</>}
      </button>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

// ---- Submit Screen ----
function SubmitScreen({ job, onSubmit }: { job: Job; onSubmit: (ok: boolean, msg: string) => void }) {
  const { submitProof, cancelActiveWork } = useAppStore();
  const [proof, setProof] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // 10-min timer
  const [secsLeft, setSecsLeft] = useState(600);
  useEffect(() => {
    const t = setInterval(() => setSecsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(secsLeft / 60)).padStart(2, '0');
  const ss = String(secsLeft % 60).padStart(2, '0');
  const expired = secsLeft === 0;

  const doSubmit = () => {
    if (expired) {
      cancelActiveWork();
      onSubmit(false, 'সময় শেষ হয়ে গেছে। কাজটি বাতিল করা হয়েছে।');
      return;
    }
    if (!proof) {
      setToast('অনুগ্রহ করে প্রমাণের স্ক্রিনশট আপলোড করুন।');
      return;
    }
    const res = submitProof(job.id, proof);
    onSubmit(res.success, res.message);
  };

  return (
    <div className="px-4 py-4">
      {/* timer */}
      <div className={cn(
        'mb-4 flex items-center justify-between rounded-xl p-3.5 text-white',
        expired ? 'bg-rose-600' : 'bg-gradient-to-r from-violet-600 to-violet-800'
      )}>
        <span className="flex items-center gap-2 text-sm font-medium">
          <Clock size={18} /> অবশিষ্ট সময়
        </span>
        <span className="font-mono text-lg font-bold tabular-nums">{mm}:{ss}</span>
      </div>

      {/* warning */}
      <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-amber-50 p-3.5 text-amber-900 ring-1 ring-amber-200">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p className="text-xs font-semibold leading-relaxed">⚠️ ভিডিও দেখে কাজ বুঝে কাজ করবেন</p>
      </div>

      {/* Platform-specific instructions */}
      <TaskInstructions platform={job.platform} />

      {/* Employer-provided extra comment lines */}
      {job.commentLines.length > 0 && (
        <div className="card mt-4">
          <p className="mb-1.5 text-xs font-bold text-slate-600">কর্মীদাতার দেওয়া কমেন্ট লাইনসমূহ:</p>
          <ul className="space-y-1">
            {job.commentLines.map((c, i) => (
              <li key={i} className="rounded-lg bg-white px-2.5 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200">{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Upload */}
      <div className="mt-4">
        <p className="mb-2 text-sm font-semibold text-slate-700">#১ পেজ ফলো করে স্ক্রিনশট নিন</p>
        <UploadBox value={proof} onChange={(f) => {
          if (!f) return setProof('');
          const r = new FileReader();
          r.onload = () => setProof(r.result as string);
          r.readAsDataURL(f);
        }} onClear={() => setProof('')} label="প্রমাণের স্ক্রিনশট আপলোড করুন" />
      </div>

      <button onClick={doSubmit} className="brand-btn mt-5 w-full py-3 text-base">
        <Upload size={18} /> কাজটি সাবমিট করুন
      </button>
      <button onClick={() => { cancelActiveWork(); onSubmit(false, 'কাজ বাতিল করা হয়েছে।'); }} className="ghost-btn mt-2 w-full">
        বাতিল করুন
      </button>

      {toast && <Toast message={toast} onClose={() => setToast(null)} tone="error" />}
    </div>
  );
}

// ---- Result Screen ----
function ResultScreen({ success, message, onDone }: { success: boolean; message: string; onDone: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div className={cn(
        'mb-5 flex h-24 w-24 items-center justify-center rounded-full animate-pop',
        success ? 'bg-emerald-100' : 'bg-rose-100'
      )}>
        {success ? <BadgeCheck size={48} className="text-emerald-600" /> : <X size={48} className="text-rose-600" />}
      </div>
      <h1 className="text-xl font-extrabold text-slate-900">
        {success ? 'প্রমাণ জমা হয়েছে!' : 'জমা দিতে ব্যর্থ'}
      </h1>
      <p className="mt-2 max-w-xs text-sm text-slate-600">{message}</p>
      {success && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2 text-amber-700">
          <Clock size={18} /> <span className="text-sm font-semibold">অ্যাডমিন যাচাইয়ের অপেক্ষায়</span>
        </div>
      )}
      <button onClick={onDone} className="brand-btn mt-6 px-8">
        <BadgeCheck size={18} /> কাজে ফিরে যান
      </button>
    </div>
  );
}
