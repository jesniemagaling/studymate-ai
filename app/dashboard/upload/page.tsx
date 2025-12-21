import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UploadPage() {
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Upload PDF</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Choose File</Button>
      </CardContent>
    </Card>
  );
}
