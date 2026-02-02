"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/upload/cloudinary", {
    method: "POST",
    body: fd,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) throw new Error(data.message || "Upload failed");
  return data.url;
}

export default function QuestionEditorCloud({ value = "", onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[140px] focus:outline-none text-sm leading-6",
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (!file) return false;

            (async () => {
              try {
                const url = await uploadToCloudinary(file);
                editor?.chain().focus().setImage({ src: url }).run();
              } catch (err) {
                alert("Image upload failed: " + err.message);
              }
            })();

            event.preventDefault();
            return true;
          }
        }

        return false;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  // ✅ keep sync with parent html
  useEffect(() => {
    if (!editor) return;
    const incoming = value || "";
    const current = editor.getHTML();
    if (incoming !== current) editor.commands.setContent(incoming, false);
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b p-2 text-xs">
        <button
          type="button"
          className="rounded-md border px-2 py-1 hover:bg-gray-50"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>

        <button
          type="button"
          className="rounded-md border px-2 py-1 hover:bg-gray-50"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>

        <button
          type="button"
          className="rounded-md border px-2 py-1 hover:bg-gray-50"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Bullets
        </button>

        <button
          type="button"
          className="rounded-md border px-2 py-1 hover:bg-gray-50"
          onClick={async () => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              try {
                const url = await uploadToCloudinary(file);
                editor.chain().focus().setImage({ src: url }).run();
              } catch (err) {
                alert(err.message);
              }
            };
            input.click();
          }}
        >
          Upload Image
        </button>

        <span className="text-gray-500">
          Paste image: <b>Ctrl + V</b>
        </span>
      </div>

      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
