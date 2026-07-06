"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

export default function ClearCartOnSuccess() {
  const { clearItem } = useCart();

  useEffect(() => {
    clearItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
