import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProjectDetailLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-3">
        <div className="h-8 w-36 animate-pulse rounded-md bg-muted" />
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        </div>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="space-y-2">
          <div className="h-5 w-24 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-border/70 shadow-sm">
            <CardContent className="pt-6">
              <div className="h-5 w-56 animate-pulse rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
