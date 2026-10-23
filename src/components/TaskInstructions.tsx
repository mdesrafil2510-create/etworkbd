import { cn } from '@/lib/cn';
import type { Platform } from '@/types';

type PlatformInstructions = {
  title: string;
  steps: string[];
  commentsTitle: string;
  comments: string[];
};

const INSTRUCTIONS: Record<string, PlatformInstructions> = {
  facebook: {
    title: 'ফেসবুক কাজের নিয়মাবলি:',
    steps: [
      'ফেসবুক অ্যাপ খুলুন এবং নির্দিষ্ট পেজ/পোস্টটি খুঁজে বের করুন।',
      'পেজে লাইক/ফলো অথবা পোস্টে কমেন্ট সম্পন্ন করুন।',
      'কাজটি সফলভাবে শেষ করার পর একটি স্পষ্ট স্ক্রিনশট নিন।',
    ],
    commentsTitle: 'কমেন্ট করার জন্য নিচের যেকোনো একটি ব্যবহার করুন:',
    comments: ['দারুণ পেজ!', 'খুবই তথ্যবহুল', 'এখন থেকে ফলো করছি'],
  },
  youtube: {
    title: 'ইউটিউব কাজের নিয়মাবলি:',
    steps: [
      'ইউটিউব ওপেন করে নির্দিষ্ট চ্যানেল বা ভিডিওটি খুঁজুন।',
      'ভিডিওটি কমপক্ষে ২ মিনিট দেখুন এবং সাবস্ক্রাইব/লাইক করুন।',
      'সাবস্ক্রাইব করার পর একটি স্পষ্ট স্ক্রিনশট গ্রহণ করুন।',
    ],
    commentsTitle: 'কমেন্ট করার জন্য নিচের যেকোনো একটি ব্যবহার করুন:',
    comments: ['খুব সুন্দর ভিডিও!', 'অনেক কিছু শিখতে পারলাম', 'পরবর্তী ভিডিওর অপেক্ষায় রইলাম'],
  },
  tiktok: {
    title: 'টিকটক কাজের নিয়মাবলি:',
    steps: [
      'টিকটক অ্যাপ খুলুন এবং নির্দিষ্ট অ্যাকাউন্ট বা ভিডিওটি খুঁজুন।',
      'ভিডিওটি দেখুন এবং ফলো/লাইক করুন।',
      'কাজ শেষ হলে একটি স্পষ্ট স্ক্রিনশট নিন।',
    ],
    commentsTitle: 'কমেন্ট করার জন্য নিচের যেকোনো একটি ব্যবহার করুন:',
    comments: ['অসাধারণ ভিডিও!', 'অনেক মজা পেলাম', 'ফলো করছি'],
  },
  instagram: {
    title: 'ইনস্টাগ্রাম কাজের নিয়মাবলি:',
    steps: [
      'ইনস্টাগ্রাম অ্যাপ খুলুন এবং নির্দিষ্ট প্রোফাইল/পোস্টটি খুঁজুন।',
      'প্রোফাইলে ফলো অথবা পোস্টে লাইক/কমেন্ট করুন।',
      'কাজ সম্পন্ন হলে একটি স্পষ্ট স্ক্রিনশট নিন।',
    ],
    commentsTitle: 'কমেন্ট করার জন্য নিচের যেকোনো একটি ব্যবহার করুন:',
    comments: ['সুন্দর পোস্ট!', 'খুব ভালো লেগেছে', 'ফলো করছি'],
  },
  default: {
    title: 'ধাপে ধাপে কাজ করার নিয়ম:',
    steps: [
      'প্রদত্ত লিংকে ক্লিক করে নির্দিষ্ট পেজ/চ্যানেলে যান।',
      'নির্দেশনা অনুযায়ী কাজটি সম্পূর্ণ করুন।',
      'কাজ সম্পন্ন হওয়ার পর একটি স্পষ্ট স্ক্রিনশট জমা দিন।',
    ],
    commentsTitle: 'প্রয়োজনে নিচের কমেন্টগুলো ব্যবহার করুন:',
    comments: ['ধন্যবাদ!', 'খুব ভালো সার্ভিস', 'সম্পূর্ণ করা হয়েছে'],
  },
};

const PLATFORM_KEY: Partial<Record<Platform, keyof typeof INSTRUCTIONS>> = {
  Facebook: 'facebook',
  YouTube: 'youtube',
  TikTok: 'tiktok',
  Instagram: 'instagram',
};

export function TaskInstructions({ platform }: { platform: Platform }) {
  const key = PLATFORM_KEY[platform] ?? 'default';
  const current = INSTRUCTIONS[key];

  return (
    <div className="card">
      <h3 className="mb-3 text-sm font-bold text-slate-800">{current.title}</h3>
      <ol className="mb-4 space-y-2.5">
        {current.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed text-slate-700">{step}</p>
          </li>
        ))}
      </ol>
      {current.comments.length > 0 && (
        <div className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
          <p className="mb-2 text-xs font-semibold text-slate-600">{current.commentsTitle}</p>
          <div className="space-y-2">
            {current.comments.map((comment, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-center text-xs font-medium text-slate-700 shadow-sm transition',
                  'hover:border-violet-200 hover:bg-violet-50'
                )}
              >
                {comment}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
