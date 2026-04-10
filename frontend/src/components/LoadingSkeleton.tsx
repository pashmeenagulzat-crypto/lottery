import React from 'react';

export const LotteryCardSkeleton: React.FC = () => (
  <div className="glass overflow-hidden mb-3 animate-pulse">
    <div className="bg-white/5 p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-4 w-24 bg-white/10 rounded-lg mb-2" />
          <div className="h-7 w-32 bg-white/10 rounded-lg" />
        </div>
        <div className="h-8 w-20 bg-white/10 rounded-lg" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-white/10 rounded-xl" />
        ))}
      </div>
    </div>
    <div className="px-4 pb-4 pt-3">
      <div className="flex justify-between mb-2">
        <div className="h-3 w-24 bg-white/10 rounded" />
        <div className="h-3 w-12 bg-white/10 rounded" />
      </div>
      <div className="h-2 bg-white/10 rounded-full" />
    </div>
  </div>
);

export const TransactionSkeleton: React.FC = () => (
  <div className="flex items-center gap-3 py-3 border-b border-white/5 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0" />
    <div className="flex-1">
      <div className="h-4 w-40 bg-white/10 rounded mb-2" />
      <div className="h-3 w-24 bg-white/10 rounded" />
    </div>
    <div className="h-5 w-16 bg-white/10 rounded" />
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="glass p-4 animate-pulse">
    <div className="h-8 w-8 rounded-xl bg-white/10 mb-3" />
    <div className="h-7 w-20 bg-white/10 rounded mb-2" />
    <div className="h-3 w-24 bg-white/10 rounded" />
  </div>
);

export const TicketSkeleton: React.FC = () => (
  <div className="rounded-xl border border-white/10 overflow-hidden animate-pulse mb-2">
    <div className="flex items-center px-6 py-3 gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex-shrink-0" />
      <div className="flex-1">
        <div className="h-4 w-32 bg-white/10 rounded mb-2" />
        <div className="h-3 w-24 bg-white/10 rounded" />
      </div>
      <div className="h-4 w-20 bg-white/10 rounded" />
    </div>
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="px-4 pt-4 animate-pulse">
    <div className="h-8 w-48 bg-white/10 rounded-xl mb-2" />
    <div className="h-4 w-32 bg-white/10 rounded mb-6" />
    {[1, 2, 3].map((i) => (
      <LotteryCardSkeleton key={i} />
    ))}
  </div>
);
