import WebsiteResourceManager from "@/components/website/WebsiteResourceManager";

const fields = [
  { name: "title", label: "Notification Title", required: true },
  { name: "message", label: "Message", type: "textarea", rows: 4 },
  { name: "linkUrl", label: "Link URL" },
  { name: "publishDate", label: "Publish Date", type: "date" },
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

export default function WebsiteNotificationsPage() {
  return (
    <WebsiteResourceManager
      title="Recent Notification Centre"
      description="Create recent notices, admission updates, exam alerts, and other website announcements."
      endpoint="/api/website/notifications"
      fields={fields}
      columns={[
        { label: "Title", key: "title" },
        { label: "Date", key: "publishDate" },
        { label: "Link", key: "linkUrl" },
        { label: "Status", key: "status" },
      ]}
      emptyText="No notifications added yet."
    />
  );
}
