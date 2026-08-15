export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 animate-pulse dark:bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-5 w-36 bg-slate-200 rounded-lg" />
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 grid grid-cols-5 gap-4 border-b border-slate-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="divide-y divide-slate-100">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="h-4 w-32 bg-slate-100 rounded-lg" />
                <div className="h-4 w-24 bg-slate-100 rounded-lg" />
                <div className="ml-auto h-5 w-20 bg-slate-100 rounded-lg" />
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                  <div className="h-8 w-8 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}