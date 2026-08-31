"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ActivityModal } from "@/features/categories/components/ActivityModal";
import { createSubcategoryAction } from "@/features/categories/actions/subcategory.actions";
import type { CategoryHomeData } from "@/features/home/components/CategoryHomeCard";
import type { Complexity } from "@/lib/constants/default-subcategories";

export function AddTaskFlow({
  categories,
}: {
  categories: CategoryHomeData[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleCreate(
    values: { name: string; icon: string; color: string; complexity: Complexity },
    meta: { categoryId: string | null },
  ) {
    if (!meta.categoryId) {
      return Promise.resolve({ success: false, error: "Elige una categoría primero." });
    }
    return createSubcategoryAction({ categoryId: meta.categoryId, ...values }).then(
      (result) => {
        if (result.success) {
          router.refresh();
        }
        return result;
      },
    );
  }

  return (
    <div className="w-full">
      <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.08 }}>
        <Button variant="secondary" onClick={() => setOpen(true)} className="w-full">
          <Plus className="size-4" />
          Agregar Actividad
        </Button>
      </motion.div>

      <ActivityModal
        open={open}
        categories={categories}
        onSubmit={handleCreate}
        onSaved={() => router.refresh()}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
