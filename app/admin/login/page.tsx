"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/lib/admin-actions";
import "../admin.css";

export default function LoginPage() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, {});
  return (
    <div className="adm-login">
      <form action={action}>
        <img src="/img/logo_yellow.svg" alt="SK" style={{ background: "#171717", borderRadius: 10, padding: 10 }} />
        <h1>ადმინ პანელი</h1>
        <label className="adm-field"><span>მომხმარებელი</span><input type="text" name="username" autoComplete="username" required /></label>
        <label className="adm-field"><span>პაროლი</span><input type="password" name="password" autoComplete="current-password" required /></label>
        {state.error && <div className="adm-status err">{state.error}</div>}
        <button className="adm-btn" disabled={pending}>{pending ? "შესვლა..." : "შესვლა"}</button>
      </form>
    </div>
  );
}
