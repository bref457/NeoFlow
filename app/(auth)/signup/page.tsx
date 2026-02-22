import Link from "next/link";
import { signUp } from "../actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage({ searchParams }: { searchParams?: { error?: string } }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Registrieren</CardTitle>
          <CardDescription>Erstelle ein Konto.</CardDescription>
          {searchParams?.error ? <p className="text-sm text-red-600">{searchParams.error}</p> : null}
        </CardHeader>
        <CardContent>
          <form action={signUp} className="space-y-3">
            <Input name="email" type="email" placeholder="email@domain.com" required />
            <Input name="password" type="password" placeholder="Passwort" required />
            <Button type="submit" className="w-full">Account erstellen</Button>
          </form>

          <p className="mt-4 text-sm text-muted-foreground">
            Schon ein Konto? <Link className="underline" href="/login">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}