import WebsiteResourceManager from "@/components/website/WebsiteResourceManager";

const fields = [
  { name: "title", label: "Banner Title", required: true },
  { name: "subtitle", label: "Subtitle" },
  { name: "imageUrl", label: "Image URL" },
  { name: "linkUrl", label: "Link URL" },
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

export default function WebsiteBannersPage() {
  return (
    <WebsiteResourceManager
      title="Website Banners"
      description="Manage homepage and campaign banners shown on the public website."
      endpoint="/api/website/banners"
      fields={fields}
      columns={[
        { label: "Title", key: "title" },
        { label: "Image", key: "imageUrl" },
        { label: "Order", key: "sortOrder" },
        { label: "Status", key: "status" },
      ]}
      emptyText="No banners added yet."
    />
  );
}
