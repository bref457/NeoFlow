"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendTelegram, sendNotifyEmail } from "@/lib/notify";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`);

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect(`/signup?error=${encodeURIComponent(error.message)}`);

  void sendTelegram(`🆕 <b>Neue Anmeldung</b>\n\n📧 ${email}`);
  void sendNotifyEmail({
    subject: "Neue Anmeldung auf NeoFlow",
    html: `<p>Ein neuer User hat sich registriert:</p><p><strong>${email}</strong></p>`,
  });

  redirect("/login?message=Account erstellt. Falls nötig: E-Mail bestätigen, dann einloggen.");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
