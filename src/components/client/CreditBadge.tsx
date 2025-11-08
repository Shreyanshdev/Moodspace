"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface CreditBadgeProps {
  credits: number;
}

export function CreditBadge({ credits }: CreditBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
      <Sparkles className="h-3.5 w-3.5" />
      <span className="font-medium">{credits} Credits</span>
    </Badge>
  );
}

