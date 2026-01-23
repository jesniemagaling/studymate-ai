'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';

type Flashcard = {
  front: string;
  back: string;
  keyword: string;
};

export default function FlashcardStudy() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [flipIndex, setFlipIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!params?.id) return;

    fetch(`/api/results/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCards(data.result?.content || []);
      });
  }, [params?.id]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Flashcard Study Mode</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map((card, index) => (
              <div
                key={index}
                onClick={() => setFlipIndex(flipIndex === index ? null : index)}
                className="cursor-pointer"
              >
                <div
                  className={clsx(
                    'border rounded-xl p-6 min-h-37.5 transition-all bg-background shadow-sm',
                    flipIndex === index && 'bg-primary text-white'
                  )}
                >
                  {flipIndex === index ? (
                    <p>{card.back}</p>
                  ) : (
                    <p className="font-semibold">{card.front}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button className="mt-6" onClick={() => router.push('/results')}>
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
