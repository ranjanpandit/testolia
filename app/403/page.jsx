export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h1 className="text-3xl font-bold text-red-600">403</h1>
        <p className="mt-2 text-lg">You do not have permission to access this page.</p>
      </div>
    </div>
  );
}
