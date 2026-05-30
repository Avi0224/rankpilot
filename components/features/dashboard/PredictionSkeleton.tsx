import { Skeleton } from "@/components/ui/skeleton"

export function PredictionSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-blue-900/30 flex flex-col h-full space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>
      
      <div className="space-y-2 flex-1">
        <Skeleton className="h-6 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
        <Skeleton className="h-3 w-1/2 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />

      <div className="pt-4 border-t border-blue-900/20 flex justify-between items-center">
        <div className="flex-1 mr-4">
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  )
}
