type AdminLoginFormProps = {
  nextPath: string;
  passwordConfigured: boolean;
  error?: string;
};

function getErrorMessage(error: string | undefined): string | null {
  if (error === "invalid_password") return "Invalid password.";
  if (error === "missing_password") return "Admin access is not configured.";
  return null;
}

export function AdminLoginForm({ nextPath, passwordConfigured, error }: AdminLoginFormProps) {
  const message = getErrorMessage(error);

  return (
    <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-black/30">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-slate-100">Systems admin panel</h1>
        <p className="mt-2 text-sm text-slate-400">Enter the admin password to access internal operational details.</p>
      </div>

      {!passwordConfigured ? (
        <div className="rounded-lg border border-amber-800/60 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
          `ADMIN_PANEL_PASSWORD` is not configured.
        </div>
      ) : (
        <form className="space-y-4" action="/api/admin/login" method="post">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Password</span>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition-colors focus:border-emerald-500"
              type="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </label>
          {message ? <p className="text-sm text-rose-300">{message}</p> : null}
          <button
            type="submit"
            className="w-full rounded-lg border border-emerald-700/70 bg-emerald-900/30 px-3 py-2 text-sm font-medium text-emerald-200 transition-colors hover:border-emerald-500"
          >
            Enter admin panel
          </button>
        </form>
      )}
    </div>
  );
}
