"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function QuestionEditor({ value, onChange }) {
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["image", "link"],
        ["clean"],
      ],
      handlers: {
        image: async function () {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload/question-image", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();
            const quill = this.quill;
            const range = quill.getSelection();
            quill.insertEmbed(range.index, "image", data.url);
          };
        },
      },
    },
  };

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
    />
  );
}
