// app/student/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="relative w-48 h-48">
        {/* Spinning circle */}
        <div className="absolute inset-0 animate-spin rounded-full border-12 border-transparent border-t-indigo-600 border-r-indigo-600"></div>
        
        {/* Centered text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">NH</div>
            <div className="text-2xl font-semibold text-indigo-500">Exam</div>
          </div>
        </div>
      </div>
    </div>
  );
}