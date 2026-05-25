import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { CreateWorkRequestForm } from "@/features/work-requests/ui/create-form";

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Submit a work request</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateWorkRequestForm />
        </CardContent>
      </Card>
    </div>
  );
}
