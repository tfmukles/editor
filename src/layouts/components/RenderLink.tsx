import { sanitizedPath } from "@/lib/utils/common";
import { NavLink } from "@/partials/NavLink";
import { IConfig, IFiles } from "@/types";
import { cn } from "@udecode/cn";
import { File, Folder, FolderOpen } from "lucide-react";
import path from "path";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Icons } from "./ui/icons";

const Icon: any = {
  default: <File className="mr-3 w-5 h-5" />,
  folder: <Folder className="mr-3 w-5 h-5" />,
  md: <Icons.markdown className="mr-3 w-5 h-5" />,
  toml: <Icons.toml className="mr-3 w-5 h-5" />,
  mdx: <Icons.markdown className="mr-3 w-5 h-5" />,
};

export default function RenderLink({
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
}) {
  return files?.map((file, index) => {
    const isIncluded = config.themeConfig?.some((item: string) => {
      const { ext } = path.parse(item);
      if (ext) {
        return file.path.includes(item);
      }

      return file.path.includes(sanitizedPath(item) + "/");
    });

    if (!isIncluded) {
      return (
        <RenderLink
          key={index}
          files={file.children}
          config={config}
          orgId={orgId}
          projectId={projectId}
        />
      );
    }

    if (file.children) {
      return (
        <li key={file.path}>
          <Accordion
            className={cn("relative", className)}
            type="single"
            collapsible
            defaultValue={index.toString()}
          >
            <AccordionItem value={`${index}`} className="border-0">
              <NavLink
                className={cn(
                  "flex items-center pr-4 py-2.5 rounded  text-foreground w-full group",
                )}
                href={`/org-${orgId}/${projectId}/${file.path}`}
                activeClassName={
                  file.path.replace("files/", "") !== config.content.root
                    ? "bg-background text-primary"
                    : ""
                }
              >
                <AccordionTrigger
                  className={cn(
                    "text-sm hover:no-underline w-full [&[data-state=open]>svg]:rotate-0 justify-start space-x-2 p-0 h-auto",
                  )}
                >
                  <>
                    <FolderOpen className="inline-block size-6" />
                    <span className="group-hover:text-primary flex-1 text-left">
                      {file.name}
                    </span>
                  </>
                </AccordionTrigger>
              </NavLink>

              <AccordionContent>
                <ul>
                  <RenderLink
                    key={index}
                    files={file.children}
                    config={config}
                    orgId={orgId}
                    projectId={projectId}
                  />
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </li>
      );
    }

    return (
      <li key={file.path}>
        <NavLink
          className="flex ml-4 text-foreground items-center px-4 py-2.5 rounded hover:text-primary"
          activeClassName="bg-background text-primary"
          href={`/org-${orgId}/${projectId}/configuration/${file.path.replace(
            "files/",
            "",
          )}`}
        >
          <span>{file.name}</span>
        </NavLink>
      </li>
    );
  });
}
