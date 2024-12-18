import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UpdatePassword from "./_components/change-password-form";
import UserDetailsForm from "./_components/update-profile-form";

export default async function Account() {
  const { user } = (await auth()) || {};
  return (
    <div className="grid xl:grid-cols-2 gap-6 lg:gap-8">
      <Card>
        <CardHeader className="pb-6">
          <CardTitle>Update Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserDetailsForm {...user!} />
        </CardContent>
      </Card>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-6">
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <UpdatePassword />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
