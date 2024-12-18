"use client";

import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Arrangement, ITree } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import * as z from "zod";

export const headingSchema = z.object({
  heading: z.string().min(2, {
    message: "heading must be at least 2 characters.",
  }),
});

export default function HeadingForm(props: {
  trees: ITree[];
  handleArrangement: ({
    newArrangement,
  }: {
    newArrangement: Arrangement;
  }) => void;
  arrangements: Arrangement[];
  arrangement?: Arrangement;
}) {
  const { handleArrangement, arrangements, arrangement } = props;
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const headingForm = useForm<z.infer<typeof headingSchema>>({
    resolver: zodResolver(headingSchema),
    defaultValues: {
      heading: arrangement?.groupName ?? "",
    },
  });

  const heading = headingForm.watch("heading");

  useEffect(() => {
    const foundedIndex = arrangements.findIndex(
      (arrangement) =>
        arrangement.type === "heading" && arrangement.groupName === heading,
    );
    const arrangement = arrangements?.[foundedIndex];

    if (!props.arrangement && arrangement) {
      headingForm.setError("heading", {
        message: "heading already exists",
      });
    }
  }, [heading]);

  return (
    <Form {...headingForm}>
      <form
        onSubmit={headingForm.handleSubmit((data) => {
          const newArrangement: Arrangement = {
            id: arrangement?.id || uuidv4(),
            type: "heading",
            groupName: data.heading,
            targetPath: "",
          };
          handleArrangement({
            newArrangement,
          });
          modalCloseRef.current?.click();
        })}
        className="space-y-4"
      >
        <FormField
          control={headingForm.control}
          name="heading"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="heading" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Button
            disabled={!headingForm.formState.isValid}
            size={"lg"}
            type="submit"
            className="w-full"
          >
            {!!arrangement ? "Update" : "Add"}
          </Button>
          <DialogClose ref={modalCloseRef} className="sr-only">
            Close
          </DialogClose>
        </div>
      </form>
    </Form>
  );
}
