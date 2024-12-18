"use client";

import { Org } from "@/actions/org/types";
import { moveProject } from "@/actions/project";
import { Project } from "@/actions/project/types";
import AddSite from "@/components/add-site";
import Avatar from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useSubmitForm } from "@/hooks/useSubmit";
import { EllipsisVertical, ExternalLink, MoveLeft, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import DeleteSite from "./delete-site";

export default function Sites({
  sites,
  orgId,
  orgs = [],
}: {
  sites: Project[];
  orgId: string;
  orgs?: Org[];
}) {
  const { toast } = useToast();
  const { action, state } = useSubmitForm<
    Project<{ id: string; org_id: string }>
  >(moveProject, {
    onSuccess: (data) => {
      toast({
        title: "Site moved successfully!",
      });
    },
  });

  const [showOrgs, setShowOrgs] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      {sites.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-8">
            <h2>Sites</h2>
            <div className="flex space-x-4 items-center justify-center">
              <AddSite orgId={`${orgId}`}>
                <Plus className="size-4 mr-1" />
                <span className="flex-1 text-sm capitalize">Add New Site</span>
              </AddSite>
            </div>
          </div>
          <div className="grid grid-cols-12 bg-light rounded-lg px-8 py-2.5 text-dark font-semibold">
            <div className="col-span-6 flex text-h6">Site Name</div>
            <div className="col-span-4 text-left text-h6">Repository</div>
            <div className="col-span-2 text-right text-h6"></div>
          </div>
        </>
      )}

      {sites.length === 0 ? (
        <div className="grid place-items-center h-full">
          <div className="max-w-xs mx-auto text-center">
            <Image
              className="mb-8 max-w-full"
              src="/images/icons/laptop.svg"
              alt="laptop"
              width={350}
              height={220}
            />
            <h2 className="mb-1.5">No Site Added Yet!</h2>
            <p className="mb-3.5 text-muted-foreground text-sm">
              Rest easy - your streaks are always safe while Vacation Mode is
              on.
            </p>
            <AddSite orgId={`${orgId}`}>
              <Plus className="size-4 mr-1" />
              <span className="flex-1 text-sm capitalize">Add New Site</span>
            </AddSite>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4 mt-6">
            {sites?.map((site) => {
              const {
                project_name,
                repository,
                branch,
                project_image,
                project_id,
              } = site;
              return (
                <div
                  className="grid grid-cols-12 border-border border rounded-lg overflow-hidden items-center [&>*]:py-8 hover:bg-muted/20 transition"
                  key={project_id}
                >
                  <div className="col-span-6 h-full !py-0 flex items-center space-x-5 relative group">
                    <div className="bg-light h-full text-center w-[188px] px-10 relative">
                      {project_image ? (
                        <Avatar
                          email=""
                          src={project_image}
                          alt={project_name}
                          width={188}
                          height={188}
                          className="absolute inset-0 object-cover h-full w-full"
                        />
                      ) : (
                        <h3 className="h-full capitalize flex items-center justify-center text-primary">
                          {project_name[0]}
                        </h3>
                      )}
                    </div>

                    <h3 className="text-primary text-lg">{project_name}</h3>
                    <Link
                      href={`/${orgId}/${project_id}`}
                      className="absolute inset-0"
                    />
                  </div>

                  <div className="col-span-4 text-left text-muted-foreground w-full">
                    <Button
                      variant={"link"}
                      className="text-left inline-block text-secondary-foreground justify-start p-0 w-auto"
                    >
                      <Link
                        target="_blank"
                        href={`https://github.com/${repository}/tree/${branch}`}
                        className="text-left text-secondary-foreground hover:text-primary inline-flex items-center justify-center"
                      >
                        <Icons.githubBlack className="inline-block mr-1 size-5" />
                        <span className="text-foreground">
                          {repository}/tree/{branch}
                        </span>
                        <ExternalLink className="inline-block ml-1 size-4 -translate-y-[1.5px]" />
                      </Link>
                    </Button>
                  </div>

                  <div className="col-span-2 text-right mr-3.5">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          className="text-muted-foreground"
                          variant={"ghost"}
                          size={"icon"}
                        >
                          <EllipsisVertical className="mx-auto text-secondary-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        collisionPadding={8}
                        align="end"
                        side="bottom"
                        sideOffset={-30}
                        alignOffset={35}
                        className="p-1.5 max-w-[156px]"
                      >
                        <ul>
                          {showOrgs ? (
                            <>
                              <li className="p-2 flex items-center justify-between after:absolute after:left-0 after:top-9 after:w-full after:h-px after:bg-border after:z-10 after:cursor-default after:pointer-events-none pt-0">
                                <Button
                                  type="button"
                                  variant={"outline"}
                                  size={"icon"}
                                  className="size-6"
                                  onClick={() => setShowOrgs(false)}
                                >
                                  <MoveLeft className="size-4" />
                                </Button>
                                <span className="ml-1.5">Org list</span>
                              </li>
                              {orgs.length === 0 && (
                                <li>
                                  <Button
                                    type="button"
                                    className="block text-sm rounded-lg p-2 w-full hover:no-underline hover:bg-transparent text-center"
                                    variant={"link"}
                                    disabled={isPending}
                                  >
                                    No Org Found
                                  </Button>
                                </li>
                              )}

                              {orgs.map((org) => {
                                return (
                                  <li key={org.org_id}>
                                    <Button
                                      type="button"
                                      className="block text-sm hover:bg-accent rounded-lg p-2 w-full text-left hover:no-underline"
                                      variant={"link"}
                                      disabled={isPending}
                                      onClick={() =>
                                        startTransition(() => {
                                          action({
                                            id: site.project_id,
                                            org_id: org.org_id,
                                          });
                                        })
                                      }
                                    >
                                      {org.org_name}
                                    </Button>
                                  </li>
                                );
                              })}
                            </>
                          ) : (
                            <>
                              <li>
                                <Link
                                  className="block text-sm hover:bg-accent rounded-lg p-2"
                                  href={`/${orgId}/${site.project_id}/setting`}
                                >
                                  Settings
                                </Link>
                              </li>
                              <li>
                                <DeleteSite
                                  id={project_id}
                                  org_id={orgId.slice(4)}
                                />
                              </li>
                              <li>
                                <Button
                                  variant={"link"}
                                  onClick={() => setShowOrgs(true)}
                                  className="block text-sm hover:bg-accent hover:no-underline rounded-lg p-2 w-full text-left"
                                >
                                  Move to
                                </Button>
                              </li>
                            </>
                          )}
                        </ul>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
