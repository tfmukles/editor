import { getOrg } from "@/actions/org";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import DeleteOrg from "./_components/delete-org";
import EditOrg from "./_components/form";
import OrgMembers from "./_components/org-members";

export default async function Settings(
  props: {
    params: Promise<{ orgId: string }>;
  }
) {
  const params = await props.params;
  const { user } = (await auth()) || {};
  const org = await getOrg(params.orgId.slice(4));
  if (!org.org_id) {
    return (
      <div className="flex items-center justify-center">
        <div className="py-8 px-4 mx-auto max-w-screen-md lg:py-16 lg:px-6">
          <div className="mx-auto max-w-screen-sm text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Organization Not Found
            </h1>
            <p className="text-lg text-gray-600">
              We couldn’t find the organization you’re looking for. It may have
              been removed or does not exist.
            </p>
            <Button className="py-6 px-1">
              <Link
                href="/"
                className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
              >
                Back to dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  const members = org.members;
  const member = members.find((member) => member.user_id === user?.id);

  return (
    <div className="py-12 grid grid-cols-1 2xl:grid-cols-2 gap-6 place-content-center">
      {org.owner === user?.id && (
        <>
          <EditOrg {...org} />
          {!org.default && (
            <Card className="order-3">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TriangleAlert className="size-5  text-destructive mr-2 stroke-2" />
                  Delete Organization
                </CardTitle>
                <CardDescription>
                  Deleting your organization will permanently delete all charts,
                  people, sharing, and settings. This action cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <DeleteOrg id={org.org_id} variant={"destructive"} />
              </CardFooter>
            </Card>
          )}
        </>
      )}
      <div>
        <OrgMembers {...org} userRole={member?.role!} />
      </div>
    </div>
  );
}
