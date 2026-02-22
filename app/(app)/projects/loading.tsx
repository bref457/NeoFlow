import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProjectsLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="space-y-2">
        <div className="h-8 w-44 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="space-y-2">
          <div className="h-5 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="border-border/70 shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="h-5 w-52 animate-pulse rounded-md bg-muted" />
                <div className="h-4 w-40 animate-pulse rounded-md bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
