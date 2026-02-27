import Image from "next/image";
import { StatusDashboard } from "@/components/status-dashboard";

export default function HomePage() {
  return (
    <main className="relative mx-auto max-w-6xl px-5 pb-10 pt-4 sm:px-8">
      <header className="sticky top-0 z-20 -mx-5 flex items-center justify-between border-b border-slate-800/70 bg-[#05080a]/90 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <a href="#" className="inline-flex items-center gap-2 text-slate-100">
          <Image src="/systems site icon.png" alt="arjun.systems icon" width={28} height={28} className="h-7 w-7 rounded-sm" />
          <span className="text-base font-semibold tracking-tight">arjun.systems</span>
        </a>
        <nav className="inline-flex items-center gap-4 text-sm text-slate-400">
          <a href="#tools" className="transition-colors hover:text-slate-200">
            Tools
          </a>
          <a href="#status" className="transition-colors hover:text-slate-200">
            Status
          </a>
          <a href="#about" className="transition-colors hover:text-slate-200">
            About
          </a>
        </nav>
      </header>

      <section className="relative overflow-hidden py-14">
        <div className="pointer-events-none absolute right-8 top-0 hidden opacity-10 md:block">
          <Image src="/systems site icon.png" alt="" width={208} height={208} className="h-52 w-52" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">Internal tools and infrastructure.</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-400">Small systems I run for myself.</p>
      </section>

      <StatusDashboard />

      <section id="about" className="scroll-mt-20 py-6">
        <h2 className="mb-4 text-sm uppercase tracking-[0.18em] text-slate-400">About</h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-300">
          arjun.systems is my internal tooling namespace for utilities, service surfaces, and operational checks.
        </p>
        <p className="max-w-3xl text-sm leading-7 text-slate-300">
          This hub is a single control panel to launch tools quickly and verify health from one place.
        </p>
      </section>

      <footer className="mt-10 border-t border-slate-800/80 pt-6 text-sm text-slate-400">
        <a
          href="https://arjuniyer.dev"
          className="inline-flex items-center gap-2 transition-colors hover:text-emerald-300"
          target="_blank"
          rel="noreferrer"
        >
          <Image src="/personal site icon.png" alt="" width={16} height={16} className="h-4 w-4 rounded-sm" />
          arjuniyer.dev
        </a>
      </footer>
    </main>
  );
}
