import { Icons } from "@/components/ui/icons";
import { Globe, LogOut, Settings } from "lucide-react";
import { signOut } from "next-auth/react";

export const dashboardMenu = [
  {
    name: "Sites",
    href: "/",
    icon: Globe,
  },
];

export const accountMenu = [
  {
    name: "Settings",
    href: "/account/",
    icon: Settings,
  },
  {
    name: "Support",
    href: "/Support",
    icon: Icons.support,
  },
  {
    name: "Logout",
    href: "/logout",
    icon: LogOut,
    onClick: signOut,
  },
];

export const siteCreateStep = [
  "Choose a Github page or template",
  "Connect the Github page to Sitepins",
  "Give your site a name, and that's it!",
];
