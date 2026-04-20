export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-9 w-52 bg-slate-200 rounded-xl" />
          <div className="h-4 w-72 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-32 bg-slate-100 rounded-xl" />
          <div className="h-9 w-36 bg-blue-100 rounded-xl" />
        </div>
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-100 rounded" />
              <div className="h-7 w-20 bg-slate-200 rounded-lg" />
              <div className="h-3 w-28 bg-slate-50 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="h-5 w-48 bg-slate-200 rounded-lg" />
          </div>
          <div className="divide-y divide-slate-50">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-64 bg-slate-100 rounded" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-3 w-16 bg-blue-100 rounded ml-auto" />
                  <div className="h-3 w-10 bg-slate-100 rounded ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-blue-100 rounded-2xl h-48" />
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="h-4 w-24 bg-slate-200 rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
