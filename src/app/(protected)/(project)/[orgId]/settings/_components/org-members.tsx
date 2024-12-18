"use client";

import { Member, Org } from "@/actions/org/types";
import Avatar from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { updateOrg } from "@/actions/org";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useDialog } from "@/hooks/useDialog";
import { useSubmitForm } from "@/hooks/useSubmit";
import { addNewTeamMemberSchema, orgSchema } from "@/lib/validate";
import { zodResolver } from "@hookform/resolvers/zod";
import { EllipsisVertical, Plus, UserPlus } from "lucide-react";
import { useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import DeleteOrgMember from "./delete-org-member";

const role: { admin: string; editor: string } = {
  admin: "editor",
  editor: "admin",
};

type org = Org<
  z.infer<typeof addNewTeamMemberSchema> & {
    org_id: string;
    user_id?: string;
  }
>;

export default function OrgMembers(org: Org & { userRole: Member["role"] }) {
  const { toast } = useToast();
  const { org_name, members, org_image, org_id, owner } = org;
  const [isPending, startTransition] = useTransition();
  const orgForm = useForm<z.infer<typeof orgSchema>>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      org_name,
      org_image,
    },
  });

  const addTeamMemberForm = useForm<z.infer<typeof addNewTeamMemberSchema>>({
    resolver: zodResolver(addNewTeamMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  const { isOpen, onOpenChange } = useDialog();

  // @ts-ignore
  const { action } = useSubmitForm<org>(updateOrg, {
    onSuccess: ({ data }) => {
      // @ts-ignore
      const member = data as Org["members"][0];
      if (member.delete) {
        toast({
          title: `Deleted ${member.user_id}`,
        });
      } else {
        toast({
          title: `Update ${member.email} as an ${member.role}`,
        });
      }
      orgForm.reset({
        org_name: data?.org_name,
        org_image: data?.org_image,
      });
      addTeamMemberForm.reset();
      onOpenChange(false);
    },
    onError: ({ message }) => {
      toast({
        title: message!,
        variant: "destructive",
      });
    },
  });

  const addMemberButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div>
      <Card className="h-auto">
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-6">
          <CardTitle>Team Members</CardTitle>
          <div>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
              <DialogTrigger asChild>
                <Button ref={addMemberButtonRef} className="px-3.5" size={"lg"}>
                  <Plus className="size-6 text-light mr-1" />
                  <span>Add Member</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <Form {...orgForm}>
                  <form
                    className="text-left space-y-3 mt-4"
                    onSubmit={addTeamMemberForm.handleSubmit(
                      (data) => {
                        const formData = new FormData();
                        formData.set("email", data.email);
                        formData.set("role", data.role);
                        formData.set("org_id", org_id);
                        startTransition(() => {
                          action({
                            email: data.email,
                            role: data.role,
                            org_id: org_id,
                          });
                        });
                      },
                      (err) => {
                        console.log(err);
                      },
                    )}
                  >
                    <FormField
                      control={addTeamMemberForm.control}
                      name={"email"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Email
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              placeholder="Enter email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={addTeamMemberForm.control}
                      name={"role"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Role
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        disabled={isPending}
                        type="submit"
                        className="ml-auto"
                      >
                        {isPending ? "Granting..." : "Grant access"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pb-7">
          <Table className="rounded-lg p-1">
            {members?.length > 1 && (
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-primary">Name</TableHead>
                  <TableHead className="text-primary">Email</TableHead>
                  <TableHead className="text-primary">Role</TableHead>
                  <TableHead className="text-right last:pr-8"></TableHead>
                </TableRow>
              </TableHeader>
            )}
            <TableBody>
              {members?.length > 1 ? (
                members?.map((member) => {
                  const [first_name, last_name] =
                    member.full_name?.split(" ") ?? [];
                  const avatarFallBack =
                    first_name?.charAt(0).toUpperCase() +
                    last_name?.charAt(0).toUpperCase();

                  return (
                    <TableRow
                      key={member._id}
                      className="hover:bg-transparent group"
                    >
                      <TableCell className="font-medium group-last:pb-0">
                        <div className="flex space-x-4 items-center">
                          <Avatar
                            className="bg-light size-8 rounded-full"
                            width={32}
                            height={32}
                            email={member.email}
                            src={member.image}
                            alt={member.full_name}
                          />
                          <p className="text-foreground">
                            {" "}
                            {typeof avatarFallBack === "string"
                              ? member.full_name
                              : "Anonymous"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-left text-foreground group-last:pb-0">
                        {member.email}
                      </TableCell>
                      <TableCell className="font-medium text-foreground group-last:pb-0">
                        {owner === member.user_id ? "owner" : member.role}
                      </TableCell>
                      <TableCell className="text-right group-last:pb-0">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              className="text-muted-foreground"
                              variant={"link"}
                              size={"icon"}
                            >
                              <EllipsisVertical className="mx-auto" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            collisionPadding={8}
                            align="end"
                            className="p-1.5 max-w-[156px]"
                          >
                            <ul>
                              <li>
                                <Button
                                  className="block w-full text-left"
                                  variant={"ghost"}
                                  onClick={() => {
                                    action({
                                      org_id: org_id,
                                      user_id: member.user_id,
                                      role:
                                        member.role === "admin"
                                          ? "editor"
                                          : "admin",
                                      email: member.email,
                                    });
                                  }}
                                >
                                  Promote as {role[member.role]}
                                </Button>
                              </li>
                              <li>
                                <DeleteOrgMember
                                  action={() => {
                                    // @ts-ignore
                                    action({
                                      org_id: org_id,
                                      user_id: member.user_id,
                                    });
                                  }}
                                />
                              </li>
                            </ul>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="hover:bg-transparent ">
                  <TableCell colSpan={4} className="text-center text-xl !px-0">
                    <div className="p-10 bg-light rounded space-y-4">
                      <Button
                        variant={"secondary"}
                        size={"icon"}
                        className="bg-muted"
                      >
                        <UserPlus />
                      </Button>
                      <h2>No Member Found</h2>
                      <Button
                        onClick={() => {
                          addMemberButtonRef.current?.click();
                        }}
                        variant={"outline"}
                        size={"lg"}
                      >
                        <Plus className="size-5" /> Add Member
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
