import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/useAuth';
import { BottomNav, type TabKey } from '@/components/BottomNav';
import { HomeView } from '@/views/HomeView';
import { WorkView } from '@/views/WorkView';
import { CreateView } from '@/views/CreateView';
import { WalletView, ProfileView, WithdrawView } from '@/views/WalletView';
import { DepositView } from '@/views/DepositView';
import { AdminView } from '@/views/AdminView';
import { AuthView } from '@/views/AuthView';
import { Loader2 } from 'lucide-react';

type Screen = TabKey | 'deposit' | 'withdraw' | 'admin';

function App() {
  const { session, profile, loading } = useAuth();
  const [tab, setTab] = useState<Screen>('home');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  const go = (t: TabKey) => setTab(t);
  const displayName = profile?.full_name ?? 'User';

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-slate-100 pb-24">
      {tab === 'home' && <HomeView go={go} userName={displayName} profile={profile} />}
      {tab === 'work' && <WorkView />}
      {tab === 'create' && <CreateView />}
      {tab === 'wallet' && <WalletView go={(t) => setTab(t as Screen)} profile={profile} />}
      {tab === 'profile' && <ProfileView goAdmin={() => setTab('admin')} profile={profile} />}
      {tab === 'deposit' && <DepositView onBack={() => setTab('wallet')} />}
      {tab === 'withdraw' && <WithdrawView onBack={() => setTab('wallet')} />}
      {tab === 'admin' && <AdminView onExit={() => setTab('profile')} />}

      {tab !== 'deposit' && tab !== 'withdraw' && tab !== 'admin' && (
        <BottomNav active={tab as TabKey} onChange={(t) => setTab(t)} />
      )}
    </div>
  );
}

export async function logout() {
  await supabase.auth.signOut();
}

export default App;
