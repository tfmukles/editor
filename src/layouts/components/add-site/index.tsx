"use client";
import { addProject } from "@/actions/project";
import { Project } from "@/actions/project/types";
import { getProviders } from "@/actions/provider";
import { Provider } from "@/actions/provider/types";
import { gitFetch } from "@/actions/utils/gitFetch";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetch } from "@/hooks/useFetch";
import { useSubmitForm } from "@/hooks/useSubmit";
import { projectSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { PopoverClose } from "@radix-ui/react-popover";
import Cookies from "js-cookie";
import { ChevronsUpDown, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import FormError from "../form-error";
import { providersList } from "./data";

export default function AddSite({
  orgId,
  children,
  ...props
}: ButtonProps & { orgId: string }) {
  const pathname = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const prevProvider = useRef<Provider[] | null>(null);
  const ref = useRef<NodeJS.Timeout | null>(null);
  const [isClicked, setClicked] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const projectForm = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      provider: "Github",
      repository: "",
      branch: "",
      project_name: "",
    },
  });

  const branch = projectForm.watch("branch");
  const repository = projectForm.watch("repository");
  const provider = projectForm.watch("provider");
  const selectedProvider = prevProvider.current?.find(
    (item) => item.provider === provider,
  );

  const {
    data: providers,
    refetch,
    isLoading,
  } = useFetch(getProviders, {
    skip: false,
    onSuccess: (data) => {
      const currentSelectedProvider = prevProvider.current?.find(
        (item) => item.provider === provider,
      );
      const selectedProvider = data.find((item) => item.provider === provider);
      if (
        currentSelectedProvider?.access_token !== selectedProvider?.access_token
      ) {
        prevProvider.current = data;
        setClicked(false);
      }
    },
  });

  const { isLoading: repoLoading, data: repos } = useFetch(
    async () => {
      const { installations } = await gitFetch("GET /user/installations", {
        token: selectedProvider?.access_token!,
      });

      const repositories = await Promise.all(
        installations.map(async (installation) => {
          const data = await gitFetch(
            "GET /user/installations/{installation_id}/repositories",
            {
              installation_id: installation.id,
              token: selectedProvider?.access_token!,
              per_page: 100,
            },
          );
          return data.repositories;
        }),
      );

      return repositories.flat();
    },
    {
      skip: !selectedProvider?.access_token && !Cookies.get("app_token"),
    },
    [selectedProvider?.access_token, Cookies.get("app_token")],
  );

  const { isLoading: isBranchLoading, data: branches } = useFetch(
    async () => {
      const [userName, repo] = repository.split("/");
      const data = await gitFetch("GET /repos/{owner}/{repo}/branches", {
        token: selectedProvider?.access_token!,
        owner: userName,
        repo,
        per_page: 100,
      });

      return data;
    },
    {
      skip: !repository,
      onSuccess: (data) => {
        if (data.length === 1) {
          projectForm.setValue("branch", data[0].name);
        } else {
          projectForm.setValue("branch", "");
        }
      },
    },
    [repository],
  );

  const { action, state } = useSubmitForm<Project>(addProject, {
    onSuccess: ({ message, data: newProject }) => {
      toast.success(message);
      Cookies.set("skip", "true");
      router.push(`/${orgId}/${newProject?.project_id}`);
    },
    openToast: false,
  });

  useEffect(() => {
    if (isClicked) {
      ref.current = setInterval(() => {
        if (!isLoading) {
          refetch();
        }
      }, 1000);
    }

    return () => {
      clearInterval(ref.current!);
    };
  }, [isClicked, refetch, isLoading, providers]);

  useEffect(() => {
    return () => {
      const nextUrl = window.location.pathname;
      if (nextUrl !== pathname) {
        Cookies.remove("app_token");
      }
    };
  }, []);

  const step_1 = selectedProvider?.access_token;
  const step_2 = step_1 && provider.length > 0;
  const step_3 = step_2 && repository;
  const step_4 = step_3 && repository;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button {...props} disabled={!providers && !isClicked}>
          {children}
          {!providers && !isClicked && (
            <Loader2 className="ml-1 inline-block animate-spin size-4" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] gap-6">
        <Form {...projectForm}>
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Site</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={projectForm.handleSubmit(async (data) => {
              startTransition(async () => {
                action({
                  org_id: orgId.slice(4),
                  branch: data.branch,
                  project_name: data.project_name,
                  provider: data.provider,
                  repository: data.repository,
                });
              });
            })}
            ref={formRef}
            className="text-left space-y-3 mx-auto w-full"
          >
            <div className="space-y-6">
              <FormField
                control={projectForm.control}
                name={"project_name"}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Site Name
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="site name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-4">
                <FormField
                  control={projectForm.control}
                  name={"provider"}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        Git Provider
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your provider" />
                          </SelectTrigger>
                          <SelectContent>
                            {providersList?.map((provider) => (
                              <SelectItem
                                key={provider.name}
                                value={provider.value}
                                className="text-sm"
                                disabled={!!provider.tag}
                              >
                                <provider.icon className="size-5 inline-block mr-1 align-bottom" />
                                {provider.label}
                                {provider.tag && (
                                  <span className="absolute bg-accent rounded-full top-1/2 -translate-y-1/2 right-1 py-1 px-1.5 text-sm text-primary font-medium">
                                    {provider.tag}
                                  </span>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!step_1 && (
                  <Button
                    type="button"
                    onClick={() => {
                      setClicked(true);
                      const width = 800;
                      const height = 700;
                      const screenWidth = window.screen.width;
                      const screenHeight = window.screen.height;
                      const left = (screenWidth - width) / 2;
                      const top = (screenHeight - height) / 2;
                      window.open(
                        `https://github.com/login/oauth/authorize?scope=repo,user,admin:org&client_id=${process.env.NEXT_PUBLIC_GITHUB_APP_CLIENT_ID}&allow_signup=true`,
                        "_blank",
                        `width=${width},height=${height},left=${left},top=${top}`,
                      );
                    }}
                    className="mt-5"
                  >
                    Authenticate
                  </Button>
                )}
              </div>

              {step_2 && (
                <FormField
                  control={projectForm.control}
                  name={"repository"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Repository
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Popover modal>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded
                              className="w-full h-auto justify-between hover:text-foreground hover:bg-transparent space-y-0 !mt-0"
                            >
                              {repoLoading ? (
                                <>
                                  <div className="relative inline-flex justify-center items-center">
                                    <Loader2 className="animate-spin size-4 absolute inline-block mr-1 left-0" />
                                    <span className="pl-5">Please wait...</span>
                                  </div>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </>
                              ) : repository ? (
                                <>
                                  {repository}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </>
                              ) : (
                                <>
                                  Select a repository
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 max-h-[200px] w-[--radix-popper-anchor-width]">
                            <Command>
                              <CommandInput
                                placeholder="Search repository..."
                                className="border-none focus-visible:border-none focus:ring-0"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {repoLoading
                                    ? "Please wait..."
                                    : "No repository found"}
                                </CommandEmpty>
                                {repos?.map((repo) => (
                                  <CommandItem
                                    key={repo.name}
                                    value={repo.owner.login! + "/" + repo.name}
                                    onSelect={(currentValue) => {
                                      field.onChange(currentValue);
                                    }}
                                    asChild
                                  >
                                    <PopoverClose className="w-full group">
                                      <span className="opacity-50 text-nowrap">
                                        {repo.owner.login}/
                                      </span>
                                      <span className="w-full text-left">
                                        {repo.name}
                                      </span>

                                      <Link
                                        href={repo.html_url}
                                        target="_blank"
                                        prefetch={false}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                        }}
                                        className="hidden group-hover:block"
                                      >
                                        <ExternalLink className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                                      </Link>
                                    </PopoverClose>
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        <span className="text-sm">
                          Can’t see your repo here?{" "}
                        </span>
                        <Button
                          variant={"link"}
                          className="p-0 underline h-auto"
                          type="button"
                          onClick={() => {
                            setClicked(true);
                            const width = 800;
                            const height = 700;
                            const screenWidth = window.screen.width;
                            const screenHeight = window.screen.height;
                            const left = (screenWidth - width) / 2;
                            const top = (screenHeight - height) / 2;
                            window.open(
                              `https://github.com/apps/${process.env.NEXT_PUBLIC_GITHUB_APP_NAME}/installations/select_target`,
                              "_blank",
                              `width=${width},height=${height},left=${left},top=${top}`,
                            );
                          }}
                        >
                          Configure on GitHub
                        </Button>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {step_3 && (
                <FormField
                  control={projectForm.control}
                  name={"branch"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Branch
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => {
                            if (isBranchLoading) return;
                            field.onChange(value);
                          }}
                          value={branch}
                          disabled={isBranchLoading || !repository}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isBranchLoading ? (
                                  <div className="relative inline-flex justify-center items-center">
                                    <Loader2 className="animate-spin size-4 absolute inline-block mr-1 left-0" />
                                    <span className="pl-5">Please wait...</span>
                                  </div>
                                ) : (
                                  "Choose your branch"
                                )
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {branches?.map((branch) => (
                              <SelectItem
                                key={branch.name}
                                value={branch.name}
                                className="text-sm"
                              >
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormError {...state} />
          </form>
          {step_4 && (
            <DialogFooter className="sm:justify-end">
              <Button
                type="submit"
                disabled={isPending || (providers?.length || 0) === 0}
                onClick={() => formRef.current?.requestSubmit()}
              >
                {isPending ? "Creating..." : "Create Site"}
              </Button>
            </DialogFooter>
          )}
        </Form>
      </DialogContent>
    </Dialog>
  );
}
