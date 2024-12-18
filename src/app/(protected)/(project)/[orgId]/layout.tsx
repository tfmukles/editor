import { getOrgs } from "@/actions/org";
import { NavLink } from "@/partials/NavLink";
import Link from "next/link";
import OrgPopover from "../../(org)/_components/org-popover";
import { dashboardMenu } from "./settings/_components/data";

export default async function Layout(
  props: {
    children: React.ReactNode;
    params: Promise<{ orgId: string }>;
  }
) {
  const params = await props.params;

  const {
    children
  } = props;

  const orgs = await getOrgs();
  return (
    <div className="flex">
      <aside className="max-w-[280px] w-full border-r border-r-border h-screen bg-light sticky top-0 left-0 flex flex-col">
        <nav className="py-4 overflow-y-auto px-4 flex flex-col flex-1">
          <Link className="pb-10 pt-7 pl-4 block" href={"/"}>
            <h1>Sitepins</h1>
          </Link>
          <ul className="space-y-1 flex-1">
            {dashboardMenu.map((item) => (
              <li key={item.name}>
                <NavLink
                  href={`/${params.orgId}/${item.href}`}
                  className="flex font-medium text-dark items-center py-2.5 px-4 rounded-lg"
                  activeClassName="bg-[#EFF1F4]"
                >
                  <item.icon className="mr-1.5 size-5 stroke-1" />
                  <span className="text-text-dark">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="sticky bottom-0 p-4 bg-light">
          <OrgPopover orgs={orgs} />
        </div>
      </aside>
      <main className="flex-1 py-10 px-14 max-h-svh overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
