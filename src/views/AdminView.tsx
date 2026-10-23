import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { bdt, bdtPlain, timeAgo } from '@/lib/format';
import type { JobLevel, ProofSubmission } from '@/types';
import { cn } from '@/lib/cn';
import { Toast } from '@/components/ui';
import {
  ChevronLeft, LayoutDashboard, Image as ImageIcon, Users, Wallet as WalletIcon,
  Settings as SettingsIcon, Check, X, Clock, Shield, ShieldOff, Ban, CircleDollarSign,
  TrendingUp, TrendingDown, AlertCircle, MessageSquare, Plus, Minus,
} from 'lucide-react';

type Section = 'dashboard' | 'proofs' | 'deposits' | 'withdrawals' | 'users' | 'settings';

export function AdminView({ onExit }: { onExit: () => void }) {
  const [section, setSection] = useState<Section>('dashboard');
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Admin header */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-slate-900 text-white">
        <div className="flex items-center gap-2 px-3 py-3">
          <button onClick={onExit} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 active:scale-95">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-violet-400" />
            <h1 className="text-base font-bold">Admin Dashboard</h1>
          </div>
        </div>
        {/* Section tabs */}
        <div className="flex gap-1 overflow-x-auto px-2 pb-2">
          {([
            ['dashboard', 'Overview', LayoutDashboard],
            ['proofs', 'Proofs', ImageIcon],
            ['deposits', 'Deposits', TrendingUp],
            ['withdrawals', 'Withdrawals', TrendingDown],
            ['users', 'Users', Users],
            ['settings', 'Settings', SettingsIcon],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                section === key ? 'bg-violet-600 text-white' : 'bg-white/10 text-slate-300'
              )}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-24">
        {section === 'dashboard' && <Dashboard />}
        {section === 'proofs' && <Proofs />}
        {section === 'deposits' && <Deposits />}
        {section === 'withdrawals' && <Withdrawals />}
        {section === 'users' && <UsersSection />}
        {section === 'settings' && <SettingsSection />}
      </div>
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard() {
  const { jobs, proofs, deposits, withdrawals, users } = useAppStore();
  const pendingProofs = proofs.filter((p) => p.status === 'Pending').length;
  const pendingDep = deposits.filter((d) => d.status === 'pending').length;
  const pendingWd = withdrawals.filter((w) => w.status === 'pending').length;
  const blocked = users.filter((u) => u.blocked).length;
  const activeJobs = jobs.filter((j) => j.status === 'Active').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={<TrendingUp size={18} />} label="Active Jobs" value={`${activeJobs}`} tone="bg-emerald-100 text-emerald-700" />
        <Metric icon={<Clock size={18} />} label="Pending Proofs" value={`${pendingProofs}`} tone="bg-amber-100 text-amber-700" />
        <Metric icon={<WalletIcon size={18} />} label="Pending Deposits" value={`${pendingDep}`} tone="bg-blue-100 text-blue-700" />
        <Metric icon={<TrendingDown size={18} />} label="Pending Withdrawals" value={`${pendingWd}`} tone="bg-rose-100 text-rose-700" />
        <Metric icon={<Users size={18} />} label="Total Users" value={`${users.length}`} tone="bg-violet-100 text-violet-700" />
        <Metric icon={<Ban size={18} />} label="Blocked Users" value={`${blocked}`} tone="bg-slate-200 text-slate-700" />
      </div>

      <h2 className="text-sm font-bold text-slate-700">Recent Proofs</h2>
      <div className="space-y-2">
        {proofs.slice(0, 4).map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
            <img src={p.screenshot} alt="" className="h-12 w-12 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{p.workerName}</p>
              <p className="text-xs text-slate-500">{p.workId} · {timeAgo(p.submittedAt)}</p>
            </div>
            <StatusPill status={p.status} />
          </div>
        ))}
        {proofs.length === 0 && <Empty text="No proofs submitted yet." />}
      </div>
    </div>
  );
}

function Metric({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 shadow-sm">
      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', tone)}>{icon}</span>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

// ---------- Proofs ----------
function Proofs() {
  const { proofs, approveProof, rejectProof, jobs } = useAppStore();
  const [reviewing, setReviewing] = useState<ProofSubmission | null>(null);
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const pending = proofs.filter((p) => p.status === 'Pending');
  const reviewed = proofs.filter((p) => p.status !== 'Pending');

  const approve = (id: string) => {
    approveProof(id);
    setReviewing(null);
    setToast('Proof approved. Reward credited to worker.');
  };
  const reject = (id: string) => {
    if (!reason.trim()) { setToast('Enter a rejection reason.'); return; }
    rejectProof(id, reason.trim());
    setReviewing(null); setReason('');
    setToast('Proof rejected. Slot restored.');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-slate-700">Pending Review ({pending.length})</h2>
      {pending.length === 0 && <Empty text="No pending proofs." />}
      <div className="space-y-3">
        {pending.map((p) => {
          const job = jobs.find((j) => j.id === p.jobId);
          return (
            <div key={p.id} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <img src={p.screenshot} alt="proof" className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{job?.jobTitle ?? p.workId}</p>
                  <p className="text-xs text-slate-500">Worker: {p.workerName}</p>
                  <p className="text-xs text-slate-500">Reward: {bdt(p.reward)} · {timeAgo(p.submittedAt)}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setReviewing(p)} className="brand-btn-soft flex-1 py-2 text-xs">
                  <ImageIcon size={14} /> Review
                </button>
                <button onClick={() => approve(p.id)} className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white active:scale-95">
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => { setReviewing(p); }} className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white active:scale-95">
                  <X size={14} /> Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {reviewed.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-bold text-slate-700">Reviewed ({reviewed.length})</h2>
          <div className="space-y-2">
            {reviewed.slice(0, 12).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                <img src={p.screenshot} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{p.workerName}</p>
                  <p className="text-xs text-slate-500">{p.workId} · {bdt(p.reward)}</p>
                </div>
                <StatusPill status={p.status} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Review modal */}
      {reviewing && (
        <Modal onClose={() => { setReviewing(null); setReason(''); }} title="Review Proof">
          <img src={reviewing.screenshot} alt="proof" className="w-full rounded-xl" />
          <div className="mt-3 space-y-1 text-sm">
            <p><span className="text-slate-500">Worker:</span> <span className="font-semibold">{reviewing.workerName}</span></p>
            <p><span className="text-slate-500">Work ID:</span> <span className="font-mono">{reviewing.workId}</span></p>
            <p><span className="text-slate-500">Reward:</span> <span className="font-semibold text-emerald-600">{bdt(reviewing.reward)}</span></p>
          </div>
          <div className="mt-3">
            <label className="label">Rejection reason (required to reject)</label>
            <textarea className="input min-h-[70px]" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Screenshot does not show the followed page" />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => approve(reviewing.id)} className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white active:scale-95">
              <Check size={16} /> Approve & Credit
            </button>
            <button onClick={() => reject(reviewing.id)} className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white active:scale-95">
              <X size={16} /> Reject
            </button>
          </div>
        </Modal>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} tone="success" />}
    </div>
  );
}

// ---------- Deposits ----------
function Deposits() {
  const { deposits, approveDeposit, rejectDeposit } = useAppStore();
  const pending = deposits.filter((d) => d.status === 'pending');
  const done = deposits.filter((d) => d.status !== 'pending');

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-slate-700">Pending Deposits ({pending.length})</h2>
      {pending.length === 0 && <Empty text="No pending deposit requests." />}
      <div className="space-y-3">
        {pending.map((d) => (
          <div key={d.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800">{bdt(d.amount)}</p>
                <p className="text-xs text-slate-500">{d.userName} · {d.method}</p>
                <p className="text-xs text-slate-500">TrxID: {d.trxId} · Sender: {d.senderNumber}</p>
              </div>
              <img src={d.screenshot} alt="" className="h-14 w-14 rounded-lg object-cover" />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => approveDeposit(d.id)} className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white active:scale-95">
                <Check size={14} /> Approve & Credit
              </button>
              <button onClick={() => rejectDeposit(d.id)} className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white active:scale-95">
                <X size={14} /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="mt-4 text-sm font-bold text-slate-700">History</h2>
          <div className="space-y-2">
            {done.slice(0, 12).map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{bdt(d.amount)} · {d.userName}</p>
                  <p className="text-xs text-slate-500">{d.method} · {timeAgo(d.createdAt)}</p>
                </div>
                <StatusPill status={d.status === 'approved' ? 'Approved' : 'Rejected'} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Withdrawals ----------
function Withdrawals() {
  const { withdrawals, approveWithdraw, rejectWithdraw } = useAppStore();
  const pending = withdrawals.filter((w) => w.status === 'pending');
  const done = withdrawals.filter((w) => w.status !== 'pending');

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-slate-700">Pending Withdrawals ({pending.length})</h2>
      {pending.length === 0 && <Empty text="No pending withdrawal requests." />}
      <div className="space-y-3">
        {pending.map((w) => (
          <div key={w.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-800">Net: {bdt(w.amount)}</p>
              <span className="text-xs font-semibold text-rose-600">Charge: {bdt(w.serviceCharge)}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-violet-700">Total Deducted: {bdt(w.totalDeducted)}</p>
            <p className="mt-1 text-xs text-slate-500">{w.userName} · {w.method}</p>
            <p className="text-xs text-slate-500">To: {w.receiverNumber}</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => approveWithdraw(w.id)} className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white active:scale-95">
                <Check size={14} /> Approve
              </button>
              <button onClick={() => rejectWithdraw(w.id)} className="flex-1 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white active:scale-95">
                <X size={14} /> Reject & Refund
              </button>
            </div>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <>
          <h2 className="mt-4 text-sm font-bold text-slate-700">History</h2>
          <div className="space-y-2">
            {done.slice(0, 12).map((w) => (
              <div key={w.id} className="flex items-center justify-between rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{bdt(w.amount)} · {w.userName}</p>
                  <p className="text-xs text-slate-500">{w.method} · {timeAgo(w.createdAt)}</p>
                </div>
                <StatusPill status={w.status === 'approved' ? 'Approved' : 'Rejected'} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Users ----------
function UsersSection() {
  const { users, setUserLevel, toggleBlockUser, adjustBalance } = useAppStore();
  const [adjustUser, setAdjustUser] = useState<string | null>(null);
  const [delta, setDelta] = useState('');
  const [note, setNote] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const doAdjust = () => {
    const d = parseFloat(delta);
    if (!d || d === 0) { setToast('Enter a valid amount.'); return; }
    adjustBalance(adjustUser!, d, note.trim() || 'Admin balance adjustment');
    setAdjustUser(null); setDelta(''); setNote('');
    setToast('Balance adjusted.');
  };

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold text-slate-700">Users ({users.length})</h2>
      {users.map((u) => (
        <div key={u.id} className="rounded-2xl bg-white p-3.5 ring-1 ring-slate-200">
          <div className="flex items-center gap-3">
            <img src={u.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-800">{u.name}</p>
              <p className="text-xs text-slate-500">{u.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-violet-700">{bdt(u.balance)}</p>
              <span className={cn('badge', u.blocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700')}>
                {u.blocked ? 'Blocked' : u.level}
              </span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(['Level 1', 'Level 2', 'Level 3'] as JobLevel[]).map((l) => (
              <button
                key={l}
                onClick={() => setUserLevel(u.id, l)}
                className={cn(
                  'pill text-xs',
                  u.level === l ? 'bg-violet-600 text-white ring-violet-600' : 'bg-slate-100 text-slate-600 ring-slate-200'
                )}
              >
                {l}
              </button>
            ))}
            <button
              onClick={() => setAdjustUser(u.id)}
              className="pill bg-blue-50 text-blue-700 ring-blue-200 text-xs"
            >
              <CircleDollarSign size={12} /> Adjust
            </button>
            <button
              onClick={() => toggleBlockUser(u.id)}
              className={cn(
                'pill text-xs',
                u.blocked ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-rose-50 text-rose-700 ring-rose-200'
              )}
            >
              {u.blocked ? <><Shield size={12} /> Unblock</> : <><Ban size={12} /> Block</>}
            </button>
          </div>
        </div>
      ))}

      {adjustUser && (
        <Modal onClose={() => setAdjustUser(null)} title="Adjust Balance">
          <p className="text-sm text-slate-600">Use positive to credit, negative to deduct.</p>
          <div className="mt-3">
            <label className="label">Amount (৳)</label>
            <input className="input" type="number" step="0.01" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="e.g. 50 or -20" />
          </div>
          <div className="mt-3">
            <label className="label">Note</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for adjustment" />
          </div>
          <button onClick={doAdjust} className="brand-btn mt-4 w-full py-2.5">
            <Check size={16} /> Apply Adjustment
          </button>
        </Modal>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} tone="success" />}
    </div>
  );
}

// ---------- Settings ----------
function SettingsSection() {
  const { settings, updateSettings } = useAppStore();
  const [charge, setCharge] = useState(String(settings.serviceChargePercent));
  const [minW, setMinW] = useState(String(settings.minWorkers));
  const [toast, setToast] = useState<string | null>(null);

  const save = () => {
    const c = parseFloat(charge);
    const m = parseInt(minW, 10);
    if (isNaN(c) || c < 0 || c > 100) { setToast('Service charge must be 0–100%.'); return; }
    if (isNaN(m) || m < 1) { setToast('Minimum workers must be at least 1.'); return; }
    updateSettings({ serviceChargePercent: c, minWorkers: m });
    setToast('Settings updated.');
  };

  return (
    <div className="space-y-4">
      <div className="card space-y-4">
        <p className="text-sm font-bold text-slate-800">Platform Settings</p>
        <div>
          <label className="label">Service Charge (%)</label>
          <input className="input" type="number" min="0" max="100" value={charge} onChange={(e) => setCharge(e.target.value)} />
          <p className="mt-1 text-xs text-slate-500">Applied to every new task's subtotal.</p>
        </div>
        <div>
          <label className="label">Minimum Workers per Task</label>
          <input className="input" type="number" min="1" value={minW} onChange={(e) => setMinW(e.target.value)} />
        </div>
        <button onClick={save} className="brand-btn w-full py-2.5">
          <Check size={16} /> Save Settings
        </button>
      </div>

      <div className="card">
        <p className="text-sm font-bold text-slate-800">Current Values</p>
        <div className="mt-2 space-y-1.5 text-sm">
          <Row label="Service Charge" value={`${settings.serviceChargePercent}%`} />
          <Row label="Min Workers" value={`${settings.minWorkers}`} />
        </div>
      </div>
      {toast && <Toast message={toast} onClose={() => setToast(null)} tone="success" />}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}

// ---------- shared ----------
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: 'bg-amber-100 text-amber-700',
    Approved: 'bg-emerald-100 text-emerald-700',
    Rejected: 'bg-rose-100 text-rose-700',
  };
  return <span className={cn('badge', map[status] ?? 'bg-slate-100 text-slate-600')}>{status}</span>;
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400 ring-1 ring-slate-200">{text}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-4 animate-pop" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
