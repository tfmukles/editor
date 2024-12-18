import { cn } from '@udecode/cn';
import Image from 'next/image';
import Link from 'next/link';

import { Org } from '@/actions/org/types';
import OrgPopover from '@/app/(protected)/(org)/_components/org-popover';
import { IConfig, MenuItem } from '@/types';

import { NavLink } from './NavLink';

type Props = {
  children: React.ReactNode;
  dashboardMenu: MenuItem[];
  orgs: Org[];
  config?: IConfig;
  mainClassName?: string;
  navChildren?: React.ReactNode;
  orgId?: string;
  projectId?: string;
};

export default function BaseLayout({
  children,
  config,
  dashboardMenu,
  mainClassName,
  navChildren,
  orgId,
  orgs,
  projectId,
}: Props) {
  return (
    <div className="flex">
      <aside className="max-w-[280px] pt-9 pb-4  bg-light w-full h-svh sticky flex flex-col top-0 left-0">
        <Link className="block ml-8" href={'/'}>
          <Image
            alt="sitepins"
            height={40}
            src={'/images/logo.png'}
            width={136}
          />
        </Link>
        <nav className="mb-4 flex-1 flex flex-col overflow-y-auto">
          <div className="flex flex-col mt-8 px-4 space-y-4">
            <ul className="space-y-1">
              {dashboardMenu.map((item) => {
                let { href } = item;
                if (typeof href === 'function') {
                  href = href(
                    item.name === 'Dashboard'
                      ? `/org-${orgId}/${projectId}`
                      : item.name === 'All sites'
                        ? `/org-${orgId}/projects`
                        : `/org-${orgId}/${projectId}/${config?.media.root ? `media/${config?.media.root}` : ''}`
                  );
                }

                return (
                  <li key={item.name}>
                    <NavLink
                      className="flex font-medium text-text-dark items-center py-2.5 px-4 rounded-lg"
                      activeClassName="bg-muted text-primary"
                      href={`${href}`}
                    >
                      <item.icon className="mr-1.5 size-5 stroke-[1.5]" />
                      <span className="text-text-dark">{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
            {navChildren}
          </div>
        </nav>
        <div className="px-4">
          <OrgPopover key={orgs.length} orgs={orgs} />
        </div>
      </aside>
      <main
        id="main"
        className={cn(
          'w-full p-8 2xl:px-14 2x:py-10 max-h-svh overflow-y-auto flex flex-col h-auto',
          mainClassName
        )}
      >
        {children}
      </main>
    </div>
  );
}
