export const ELEMENTS = [
  {
    type: "text",
    label: "Text Input",
    default: "Untitled Text Field",
    config: { placeholder: "", required: false }
  },
  {
    type: "textarea",
    label: "Textarea",
    default: "Untitled Textarea",
    config: { placeholder: "", required: false }
  },
  {
    type: "select",
    label: "Dropdown",
    default: "Untitled Select",
    config: { options: ["Option 1", "Option 2"], required: false }
  },
  {
    type: "checkbox",
    label: "Checkbox",
    default: "Untitled Checkbox",
    config: { required: false }
  },
  {
    type: "radio",
    label: "Radio Group",
    default: "Untitled Radio",
    config: { options: ["Option 1", "Option 2"], required: false }
  },
  {
    type: "file",
    label: "File Upload",
    default: "Upload File",
    config: { required: false }
  },
];
