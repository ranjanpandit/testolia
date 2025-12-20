"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";

// ✅ FIXED TABLE IMPORTS (named exports)
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

export default function QuestionEditor({ value, onChange }) {
  const editor = useEditor({
    immediatelyRender: false, // ✅ REQUIRED FOR SSR
    extensions: [
      StarterKit,
      Underline,
      Superscript,
      Subscript,
      CodeBlock,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder:
          "Type question here. Images, tables, formulas & code supported…",
      }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded bg-white">
      {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50 text-sm">
        <button onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
        <button onClick={() => editor.chain().focus().toggleSuperscript().run()}>x²</button>
        <button onClick={() => editor.chain().focus().toggleSubscript().run()}>x₂</button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>

        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          {"</>"}
        </button>

        <button
          onClick={() => {
            const url = prompt("Image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          🖼 Image
        </button>

        <button
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 2, cols: 2 }).run()
          }
        >
          📊 Table
        </button>
      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} className="p-4 min-h-[220px]" />
    </div>
  );
}
