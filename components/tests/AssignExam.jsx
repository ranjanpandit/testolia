"use client";

import { useEffect, useState } from "react";
import { Save, Loader2, ArrowLeft } from "lucide-react"; // ← added ArrowLeft
import { useRouter } from "next/navigation"; // ← for navigation

export default function AssignExam({ examId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [classes, setClasses] = useState([]);
  const [batches, setBatches] = useState([]);

  const [selected, setSelected] = useState({
    classes: [],
    batches: [],
  });

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    async function fetchEligibility() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/tests/${examId}/eligibility`);
        if (!res.ok) throw new Error("Failed to load eligibility data");

        const data = await res.json();

        if (mounted) {
          setClasses(data.classes || []);
          setBatches(data.batches || []);
          setSelected({
            classes: data.assigned?.classes || [],
            batches: data.assigned?.batches || [],
          });
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchEligibility();

    return () => {
      mounted = false;
    };
  }, [examId]);

  const toggle = (type, id) => {
    setSelected((prev) => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter((x) => x !== id)
        : [...prev[type], id],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/tests/${examId}/eligibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_ids: selected.classes,
          batch_ids: selected.batches,
        }),
      });

      if (!res.ok) throw new Error("Failed to save eligibility");

      alert("Eligibility updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    router.back(); // or router.push('/some-parent-page') if you prefer fixed path
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading eligibility data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header with Back button */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <h1 className="text-xl font-semibold text-gray-900">
          Assign Exam Eligibility
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Classes Section */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Classes</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select classes eligible to appear for this exam
          </p>
        </div>

        <div className="p-6">
          {classes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No classes available
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {classes.map((cls) => (
                <label
                  key={cls.id}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-md border text-sm
                    transition-colors cursor-pointer select-none
                    ${
                      selected.classes.includes(cls.id)
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selected.classes.includes(cls.id)}
                    onChange={() => toggle("classes", cls.id)}
                  />
                  <span className="truncate">{cls.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Batches Section */}
      <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Batches</h2>
          <p className="mt-1 text-sm text-gray-500">
            Select batches eligible to appear for this exam
          </p>
        </div>

        <div className="p-6">
          {batches.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No batches available
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {batches.map((batch) => (
                <label
                  key={batch.id}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 rounded-md border text-sm
                    transition-colors cursor-pointer select-none
                    ${
                      selected.batches.includes(batch.id)
                        ? "border-blue-600 bg-blue-50 text-blue-800"
                        : "border-gray-200 hover:bg-gray-50 text-gray-700"
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selected.batches.includes(batch.id)}
                    onChange={() => toggle("batches", batch.id)}
                  />
                  <span className="truncate">{batch.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100">
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className={`
            inline-flex items-center gap-2 px-6 py-2.5
            font-medium rounded-lg shadow-sm
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            transition-colors
            ${
              saving
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white"
            }
          `}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Eligibility
        </button>
      </div>
    </div>
  );
}