"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  return (
    <p className="text-sm text-red-500 text-center mb-4">
      {decodeURIComponent(error)}
    </p>
  );
}
