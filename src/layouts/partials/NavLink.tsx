"use client";

import { cn } from "@udecode/cn";
import Link, { LinkProps } from "next/link";
import { useParams, usePathname } from "next/navigation";
import path from "path";

export function NavLink({
  className,
  activeClassName,
  href,
  children,

  ...rest
}: LinkProps & {
  className?: string;
  children: React.ReactNode;
  activeClassName?: string;
}) {
  const params = useParams();
  let pathname = usePathname();
  pathname = decodeURIComponent(pathname);
  const prefix = "/" + params?.orgId + "/" + params?.projectId + "/files/";
  const file = path.dirname((params?.file as string[])?.join("/") ?? "");
  const useInclude = path.extname(pathname);
  const isActive =
    pathname === href ||
    (useInclude && (href as string)?.replace(prefix, "") === file);

  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      {...rest}
    >
      {children}
    </Link>
  );
}
