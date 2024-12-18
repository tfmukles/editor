"use client";

import { Org } from "@/actions/org/types";
import AddOrg from "@/components/add-org";
import Avatar from "@/components/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Check, Ellipsis } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { accountMenu } from "./data";

export default function OrgPopover({ orgs }: { orgs: Org[] }) {
  const { data: session, status } = useSession();
  const { user } = session || {};
  const params = useParams();
  const defaultOrgs = useMemo(() => {
    const orgId = params?.orgId?.slice(4);
    if (!orgId) {
      return orgs.find((org) => org.owner === user?.id);
    }
    return orgs.find((org) => org.org_id === params?.orgId.slice(4));
  }, [params?.orgId, status]);

  if (!defaultOrgs) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"basic"}
          className="flex whitespace-normal justify-between space-x-1 items-center bg-muted w-full h-12"
        >
          <div className="flex text-left flex-1 items-center justify-between space-x-1.5">
            {defaultOrgs?.org_image ? (
              <Avatar
                email=""
                alt={defaultOrgs.org_name}
                src={defaultOrgs?.org_image}
                width={32}
                height={32}
                className="size-8 object-cover rounded-full"
              />
            ) : (
              <span className="flex-none size-8 rounded-full flex items-center justify-center capitalize text-dark bg-background">
                {defaultOrgs?.org_name[0]}
              </span>
            )}
            <p className="flex-1 line-clamp-1 text-dark">
              {defaultOrgs?.org_name}
            </p>
          </div>
          <Ellipsis className="size-6 text-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={10}
        collisionPadding={10}
        className="w-[248px] px-6"
      >
        <ul className="[&>*]:px-3 [&>*]:py-1.5 [&>*]:rounded mb-1">
          {orgs.map((org) => (
            <li key={org.org_id} className="hover:bg-muted group relative">
              <Link
                className="flex text-left flex-1 items-center justify-between space-x-1.5 font-medium after:absolute after:inset-0 after:content-[''] static"
                href={`/org-${org.org_id}/projects`}
              >
                {org.org_image ? (
                  <Avatar
                    email=""
                    alt={org.org_name}
                    src={org.org_image}
                    width={24}
                    height={24}
                    className="size-6 object-cover rounded-full"
                  />
                ) : (
                  <span className="flex-none size-6 rounded-full flex text-xs items-center justify-center bg-muted capitalize group-hover:bg-background transition-none">
                    {org.org_name[0]}
                  </span>
                )}

                <span className="flex-1 text-sm capitalize line-clamp-1 text-dark">
                  {org.org_name}
                </span>

                {defaultOrgs?.org_id === org.org_id && (
                  <Check className="size-3" />
                )}
              </Link>
            </li>
          ))}
          <li>
            <div className="flex text-left flex-1 items-center justify-between space-x-1.5 relative">
              <AddOrg
                variant={"link"}
                className="p-0 focus-visible:ring-0 h-6 focus-visible:ring-offset-0 hover:bg-background"
                size={"sm"}
              />
            </div>
          </li>
          <li>
            <Separator />
          </li>
          {accountMenu.map((item) => (
            <li key={item.name} className="hover:bg-muted">
              {item.onClick ? (
                <Button
                  onClick={() => item.onClick()}
                  variant={"link"}
                  className="hover:no-underline p-0 h-full w-full justify-start"
                >
                  <item.icon className="size-4 inline-block mr-3" />
                  <span className="text-sm">{item.name}</span>
                </Button>
              ) : (
                <Link href={item.href} className="w-full block text-dark">
                  <item.icon className="size-4 inline-block mr-3 " />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
