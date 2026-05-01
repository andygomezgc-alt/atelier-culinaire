"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";
import type { Locale } from "@/i18n.config";

type Restaurant = {
  id: string;
  name: string;
};

export function RestaurantSwitcher({ current }: { current: { id: string; name: string } }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/restaurants")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.restaurants) {
          setRestaurants(data.restaurants);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectRestaurant = useCallback(
    (restaurantId: string) => {
      startTransition(async () => {
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ restaurantId }),
        });
        router.refresh();
      });
    },
    [router]
  );

  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-surface-2 transition-colors">
        <span className="text-body">{current.name}</span>
        <ChevronDown size={16} strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent className="w-48 py-2">
        {restaurants.map((r) => (
          <button
            key={r.id}
            onClick={() => handleSelectRestaurant(r.id)}
            disabled={isPending}
            className={`w-full text-left px-4 py-2 font-serif italic text-body transition-colors ${
              current.id === r.id
                ? "bg-surface-2 text-text"
                : "hover:bg-surface text-text-secondary"
            } ${isPending ? "opacity-50" : ""}`}
          >
            {r.name}
            {current.id === r.id && " ✓"}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
