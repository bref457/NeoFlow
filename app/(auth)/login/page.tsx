import Link from "next/link";
import { signIn } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; message?: string };
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Logge dich ein, um weiterzumachen.</CardDescription>
          {searchParams?.error ? <p className="text-sm text-red-600">{searchParams.error}</p> : null}
          {searchParams?.message ? <p className="text-sm text-muted-foreground">{searchParams.message}</p> : null}
        </CardHeader>
        <CardContent>
          <form action={signIn} className="space-y-3">
            <Input name="email" type="email" placeholder="email@domain.com" required />
            <Input name="password" type="password" placeholder="Passwort" required />
            <Button type="submit" className="w-full">Einloggen</Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Noch kein Konto? <Link className="underline" href="/signup">Registrieren</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}