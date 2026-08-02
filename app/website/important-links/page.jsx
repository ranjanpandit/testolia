import WebsiteResourceManager from "@/components/website/WebsiteResourceManager";

const fields = [
  { name: "title", label: "Link Title", required: true },
  { name: "url", label: "URL", required: true },
  { name: "sortOrder", label: "Sort Order", type: "number", defaultValue: 0 },
  {
    name: "status",
    label: "Status",
    type: "select",
    defaultValue: "active",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
];

export default function WebsiteImportantLinksPage() {
  return (
    <WebsiteResourceManager
      title="Important Links"
      description="Maintain quick links for admissions, results, downloads, external portals, and resources."
      endpoint="/api/website/important-links"
      fields={fields}
      columns={[
        { label: "Title", key: "title" },
        { label: "URL", key: "url" },
        { label: "Order", key: "sortOrder" },
        { label: "Status", key: "status" },
      ]}
      emptyText="No important links added yet."
    />
  );
}
