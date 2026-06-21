export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-56 bg-slate-200 rounded-xl mb-2" />
            <div className="h-4 w-40 bg-slate-100 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-slate-200 rounded-xl" />
            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
            <div className="h-10 w-40 bg-indigo-100 rounded-xl" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="h-4 w-24 bg-slate-100 rounded-lg mb-4" />
              <div className="h-8 w-36 bg-slate-200 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <div className="h-5 w-40 bg-slate-200 rounded-lg" />
          </div>
          <div className="divide-y divide-slate-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="h-4 w-24 bg-slate-100 rounded-lg" />
                <div className="h-4 w-20 bg-slate-100 rounded-lg" />
                <div className="ml-auto h-5 w-20 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}