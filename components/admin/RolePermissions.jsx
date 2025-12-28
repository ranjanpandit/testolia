"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RolePermissions({ role }) {
  const [all, setAll] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    fetch(`/api/admin/roles/${role.id}/permissions`)
      .then(r => r.json())
      .then(data => {
        setAll(data.all);
        setSelected(data.assigned);
      });
  }, [role.id]);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const save = async () => {
    await fetch(`/api/admin/roles/${role.id}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: selected }),
    });

    toast.success("Permissions updated");
  };

  return (
    <div className="border rounded p-4">
      <h2 className="font-bold mb-4">
        Permissions — {role.name}
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {all.map(p => (
          <label
            key={p.id}
            className="flex items-center gap-2 border rounded px-3 py-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(p.id)}
              onChange={() => toggle(p.id)}
            />
            <div>
              <p className="font-medium">{p.key}</p>
              <p className="text-xs text-gray-500">{p.description}</p>
            </div>
          </label>
        ))}
      </div>

      <Button className="mt-4" onClick={save}>
        Save Permissions
      </Button>
    </div>
  );
}
