"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SortableItem({ field, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="border p-4 rounded-lg flex items-center gap-3 bg-white dark:bg-gray-800">
      <div {...listeners} {...attributes} className="cursor-grab opacity-50">
        <GripVertical />
      </div>

      <Input className="flex-1" defaultValue={field.label} />

      <button className="text-red-500 hover:text-red-700" onClick={() => onDelete(field.id)}>
        <Trash />
      </button>
    </div>
  );
}
