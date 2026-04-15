"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword = password === process.env.ADMIN_PASSWORD;

  if (!validUsername || !validPassword) {
    return { error: "Pogrešno korisničko ime ili lozinka." };
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();

  redirect("/admin");
}

export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}
