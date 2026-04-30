'use client';

import Link from 'next/link';
import { Phone } from 'lucide-react';

export default function CrisisBanner() {
  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm md:text-base font-medium flex items-center justify-center gap-2">
      <Phone className="w-4 h-4" />
      <span>
        Butuh bantuan segera? Hubungi Layanan Darurat atau Hotline Kesehatan Jiwa (119 ext 8).
      </span>
    </div>
  );
}
