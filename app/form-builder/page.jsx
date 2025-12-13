import { Suspense } from "react";
import FormBuilderClient from "./FormBuilderClient";

export default function FormBuilderPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading Form Builder...</div>}>
      <FormBuilderClient />
    </Suspense>
  );
}
