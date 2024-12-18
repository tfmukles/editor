import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function StartingPage({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <>
      <div className="text-center max-w-sm">
        <h1 className="mb-2">Welcome to Sitepins 👋</h1>
        <p className="text-sm text-foreground">
          We're glad to have you onboard! Let's get started creating your first
          website.
        </p>
      </div>
      <div className="px-4">
        <div className="grid grid-cols-2 max-w-lg lg:max-w-[921px] gap-8">
          <Card className="col-span-2 lg:col-span-1">
            <CardHeader className="p-6">
              <div className="rounded-lg bg-light overflow-hidden">
                <img
                  className="w-full h-[260px]"
                  width={392}
                  height={260}
                  alt="Repository"
                  src="/images/repo-thumbnail.png"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <h4>Start with your own Repository</h4>
              <p className="text-sm text-foreground">
                Don't have a Github page for your website? This is the best
                starting point to learn the basics, and you can change it later.
              </p>
              {children}
            </CardContent>
          </Card>
          <Card className="lg:col-span-1 col-span-2">
            <CardHeader className="p-6 ">
              <div className="rounded-lg bg-light overflow-hidden">
                <img
                  className="w-full h-[260px]"
                  src="/images/template-thumbnail.png"
                  width={392}
                  height={260}
                  alt="Template"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <h4>Start with a Sitepins website template</h4>
              <p className="text-sm text-foreground">
                Already have an existing Notion page that you want to turn into
                a website? Start here. We will not change anything in your
                Notion page.
              </p>
              <Button size={"lg"} disabled className="w-full px-1.5 text-sm">
                Browse templates
              </Button>
            </CardContent>
          </Card>
          <div className="col-span-2 text-center">
            <Button
              onClick={() => {
                Cookies.set("skip", "true");
                router.refresh();
              }}
              className="text-center"
              variant={"ghost"}
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
