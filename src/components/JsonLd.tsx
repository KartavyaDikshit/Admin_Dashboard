'use client';

import { useServerInsertedHTML } from 'next/navigation';

export default function JsonLd({ data }: { data: any }) {
  useServerInsertedHTML(() => {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  });
  return null;
}
