import type { Metadata } from "next";
import { auth } from "@/auth";
import { TrashView } from "@/features/trash/components/TrashView";
import { listTrash } from "@/services/categories/trash.service";

export const metadata: Metadata = {
  title: "Papelera",
};

export default async function TrashPage() {
  const session = await auth();
  const userId = session!.user.id;

  const items = await listTrash(userId);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <h1 className="font-display mb-6 text-3xl font-bold text-foreground">Papelera</h1>
      <TrashView initialItems={items} />
    </div>
  );
}
