'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
};

export default function QuizPlayer() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!params?.id) return;

    fetch(`/api/results/${params.id}`)
      .then((res) => res.json())
      .then((data) => setQuiz(data.result?.content || []));
  }, [params?.id]);

  const current = quiz[index];

  const submitAnswer = () => {
    if (!selected || !current) return;

    if (selected === current.answer) {
      setScore((prev) => prev + 1);
    }

    if (index + 1 < quiz.length) {
      setIndex((prev) => prev + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  if (!current && !finished)
    return <div className="p-8 text-center">Loading quiz...</div>;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] justify-center px-4 py-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>Quiz Practice</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!finished && current ? (
            <>
              <p className="font-semibold">
                Question {index + 1} / {quiz.length}
              </p>

              <p className="text-lg">{current.question}</p>

              <div className="space-y-2">
                {current.options.map((opt) => (
                  <Button
                    key={opt}
                    variant={selected === opt ? 'default' : 'secondary'}
                    className="w-full justify-start"
                    onClick={() => setSelected(opt)}
                  >
                    {opt}
                  </Button>
                ))}
              </div>

              <Button className="w-full mt-4" onClick={submitAnswer}>
                Submit
              </Button>
            </>
          ) : (
            <>
              <p className="text-center text-2xl font-bold">Quiz Completed!</p>
              <p className="text-center text-lg">
                Score: {score} / {quiz.length}
              </p>

              <Button
                className="w-full mt-4"
                onClick={() => router.push('/results')}
              >
                Back to Results
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
