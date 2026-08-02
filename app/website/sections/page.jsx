import WebsiteResourceManager from "@/components/website/WebsiteResourceManager";

const fields = [
  { name: "title", label: "Section Title", required: true },
  { name: "slug", label: "Slug" },
  { name: "content", label: "Content", type: "textarea", rows: 6 },
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

export default function WebsiteSectionsPage() {
  return (
    <WebsiteResourceManager
      title="Website Sections"
      description="Add and edit public website content sections like About, Courses, Facilities, and Contact blocks."
      endpoint="/api/website/sections"
      fields={fields}
      columns={[
        { label: "Title", key: "title" },
        { label: "Slug", key: "slug" },
        { label: "Order", key: "sortOrder" },
        { label: "Status", key: "status" },
      ]}
      emptyText="No website sections added yet."
    />
  );
}
