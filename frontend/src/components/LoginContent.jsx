"use client";

import { useSearchParams } from "next/navigation";
import LoginPageUI from "./LoginPageUI"; // we'll extract UI

export default function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  return <LoginPageUI redirect={redirect} />;
}