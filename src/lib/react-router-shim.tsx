// Thin shim that maps react-router-dom's most common primitives onto
// @tanstack/react-router so legacy components can be ported in place.
import * as React from "react";
import {
  Link as TLink,
  useNavigate as useTNavigate,
  useLocation as useTLocation,
  useParams as useTParams,
  Outlet,
} from "@tanstack/react-router";

type AnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const Link = React.forwardRef<HTMLAnchorElement, AnchorProps & { to: string; replace?: boolean; state?: unknown }>(
  ({ to, replace, state, onClick, ...rest }, ref) => {
    // Fall back to a plain anchor so legacy paths that don't yet exist as
    // TanStack routes still navigate via the browser instead of throwing.
    return (
      <a
        ref={ref}
        href={to}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          if (typeof window !== "undefined") {
            if (replace) window.history.replaceState(null, "", to);
            window.location.href = to;
          }
        }}
        {...rest}
      />
    );
  },
);
Link.displayName = "Link";

export function useNavigate() {
  return (to: string | number, opts?: { replace?: boolean; state?: unknown }) => {
    if (typeof to === "number") {
      if (typeof window !== "undefined") window.history.go(to);
      return;
    }
    if (typeof window !== "undefined") {
      if (opts?.replace) window.location.replace(to);
      else window.location.href = to;
    }
  };
}

export function useLocation() {
  const loc = useTLocation();
  return {
    pathname: loc.pathname,
    search: loc.searchStr ?? "",
    hash: loc.hash ?? "",
    state: (loc as any).state,
  };
}

export function useParams<T extends Record<string, string> = Record<string, string>>() {
  return useTParams({ strict: false }) as T;
}

export function NavLink(props: AnchorProps & { to: string }) {
  return <Link {...props} />;
}

export const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate(to, { replace });
  }, [to, replace]);
  return null;
};

export { Outlet };
export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = (_: any) => null;
