"use client";

import { sanitizedPath } from "@/lib/utils/common";
import { NavLink } from "@/partials/NavLink";
import { IConfig, IFiles } from "@/types";
import { cn } from "@udecode/cn";
import { FolderClosed } from "lucide-react";
import { Fragment } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";

const RenderMenu = ({
  files,
  className,
  config,
  orgId,
  projectId,
}: {
  files: IFiles[] | undefined;
  config: IConfig;
  className?: string;
  orgId: string;
  projectId: string;
}) => {
  const contentRoot = config?.content?.root;
  function render(item: IFiles, index: number) {
    const hasFolder = item.children?.findIndex((child) => !child.isFile);
    const isIncluded = item.path.includes(
      sanitizedPath(contentRoot || "content") + "/",
    );

    return isIncluded && !item.isFile ? (
      <li key={item.path}>
        {hasFolder !== undefined && hasFolder !== -1 ? (
          <>
            <Accordion
              className={cn("relative", className)}
              type="single"
              collapsible={
                item.path.replace("files/", "") !== config.content.root
              }
              defaultValue={index.toString()}
            >
              <AccordionItem value={`${index}`} className="border-0">
                <NavLink
                  className={cn(
                    "pr-4 py-2.5 rounded  text-foreground w-full group block",
                  )}
                  href={`/org-${orgId}/${projectId}/${item.path}`}
                  activeClassName={
                    item.path.replace("files/", "") !== config.content.root
                      ? "bg-background text-primary"
                      : ""
                  }
                >
                  <AccordionTrigger
                    className={cn(
                      "text-sm hover:no-underline [&_[aria-label='toggle-accordion']]:hidden  [&[data-state=open]>svg]:rotate-0 justify-start space-x-2 p-0 h-auto w-full",
                    )}
                  >
                    <>
                      <FolderClosed className="inline-block size-5 stroke-[1.5]" />
                      <span className="group-hover:text-primary flex-1 text-left">
                        {item.name}
                      </span>
                    </>
                  </AccordionTrigger>
                </NavLink>

                <AccordionContent>
                  <ul>
                    <RenderMenu
                      key={item.path}
                      files={item.children}
                      config={config}
                      orgId={orgId}
                      projectId={projectId}
                    />
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        ) : (
          <NavLink
            key={item.path}
            className="flex ml-4 items-center px-4 py-2.5 rounded text-foreground hover:text-primary"
            href={`/org-${orgId}/${projectId}/${item.path}`}
            activeClassName="bg-background text-primary"
          >
            <span className="text-inherit">{item.name}</span>
          </NavLink>
        )}
      </li>
    ) : (
      <RenderMenu
        key={item.path}
        files={item.children}
        config={config}
        orgId={orgId}
        projectId={projectId}
      />
    );
  }

  return files?.map((item, index) => {
    if (item.type === "heading") {
      return (
        <li key={item.path + "_" + index}>
          <NavLink
            className="flex ml-4 text-foreground items-center px-4 py-2.5 rounded"
            activeClassName="bg-background text-primary"
            href={``}
            key={item.path + "_" + index}
          >
            <Badge>
              <span>{item.name}</span>
            </Badge>
          </NavLink>
        </li>
      );
    }

    if (item.type === "file") {
      return (
        <li key={item.path + "_" + item.type}>
          <NavLink
            className="flex ml-4 text-foreground items-center px-4 py-2.5 rounded"
            activeClassName="bg-background text-primary"
            href={`/org-${orgId}/${projectId}/${item.path}`}
          >
            <span>{item.name}</span>
          </NavLink>
        </li>
      );
    }

    return (
      <Fragment key={item.path}>
        {render({ ...item, children: item.children }, index)}
      </Fragment>
    );
  });
};

export default RenderMenu;
