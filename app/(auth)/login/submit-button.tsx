"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-aria text-black hover:bg-aria/90 font-semibold btn-shimmer"
    >
      {pending ? "Einloggen..." : "Einloggen"}
    </Button>
  );
}
