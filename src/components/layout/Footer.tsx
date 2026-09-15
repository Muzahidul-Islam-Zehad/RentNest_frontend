import Link from "next/link";
import { Home } from "lucide-react";

const footerLinks = {
  Explore: [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Browse properties" },
  ],
  Account: [
    { href: "/auth/login", label: "Login" },
    { href: "/auth/register", label: "Create account" },
  ],
  Roles: [
    { href: "/dashboard/tenant", label: "Tenant dashboard" },
    { href: "/dashboard/landlord", label: "Landlord dashboard" },
    { href: "/dashboard/admin", label: "Admin dashboard" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Home className="h-4 w-4" />
            </span>
            Rent<span className="-ml-2 text-primary">Nest</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Find &amp; list rental properties with ease. Built with Next.js, powered by a
            real backend API.
          </p>
        </div>

        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h3 className="text-sm font-semibold">{title}</h3>
            <ul className="mt-3 space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} RentNest. Assignment 5 — Next.js frontend.
      </div>
    </footer>
  );
}
