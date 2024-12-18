'use client';

import { Suspense, use, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { cn } from '@udecode/cn';
import {
  FileCog,
  FolderClosed,
  Globe,
  Home,
  Images,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import path from 'path';

import RenderLink from '@/components/RenderLink';
import RenderMenu from '@/components/RenderMenu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { slugify } from '@/lib/utils/textConverter';
import BaseLayout from '@/partials/BaseLayout';
import { NavLink } from '@/partials/NavLink';
import { resetConfig, selectConfig } from '@/redux/features/config/slice';
import {
  useGetSiteConfigQuery,
  useGetTreesQuery,
} from '@/redux/features/git/contentApi';
import { useGetOrgsQuery } from '@/redux/features/orgs/orgApi';
import { useGetProjectQuery } from '@/redux/features/project/projectApi';
import { useGetProvidersQuery } from '@/redux/features/provider/providerApi';
import { useAppDispatch } from '@/redux/store';
import { IFiles } from '@/types';

export const dashboardMenu = [
  {
    href: (href: string) => href,
    icon: Home,
    name: 'Dashboard',
  },
  {
    href: (href: string) => href,
    icon: Globe,
    name: 'All sites',
  },
  {
    href: (href: string) => href,
    icon: Images,
    name: 'Media',
  },
];

export default function Layout(props: {
  children: React.ReactNode;
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const params = use(props.params);

  const { children } = props;

  const dispatch = useAppDispatch();
  const config = useSelector(selectConfig);
  const { data: orgs, isLoading: isOrgsLoading } = useGetOrgsQuery();

  const {
    data: project,
    isFetching: isProjectFetching,
    isLoading: isProjectLoading,
  } = useGetProjectQuery(
    {
      orgId: params.orgId.slice(4),
      projectId: params.projectId,
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const { isFetching: isProviderFetching, isLoading: isProviderLoading } =
    useGetProvidersQuery(project?.user_id!, {
      refetchOnMountOrArgChange: true,
      skip: !project?.user_id || isProjectFetching,
    });

  const { isFetching, isLoading: isSiteSettingLoading } = useGetSiteConfigQuery(
    {
      owner: config.userName,
      path: '.sitepins/config.json',
      ref: config.branch,
      repo: config.repo,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: isProviderFetching || isProjectFetching || !config.token,
    }
  );

  const {
    data,
    isLoading: isTreesLoading,
    isSuccess: isTreesLoaded,
  } = useGetTreesQuery(
    {
      owner: config.userName,
      recursive: '1',
      repo: config.repo,
      tree_sha: config.branch,
    },
    {
      refetchOnMountOrArgChange: true,
      skip:
        !config.token ||
        !config.repo ||
        !config.branch ||
        isFetching ||
        isProviderFetching,
    }
  );

  const { trees = [] } = data || {};

  useEffect(() => {
    return () => {
      if (config.repo) {
        dispatch(resetConfig());
      }
    };
  }, []);

  const isLoading =
    isOrgsLoading ||
    isProjectLoading ||
    isProviderLoading ||
    isTreesLoading ||
    isSiteSettingLoading;

  if (isLoading || !config.repo)
    return (
      <div className="fixed top-0 left-0 size-full flex items-center justify-center">
        <Loader2 className="animate-spin size-6" />
      </div>
    );

  let arrangements = config.arrangement;
  const folderList = (files: IFiles[]): IFiles[] => {
    // Guard clause for when files is null/undefined
    if (!files) {
      return [];
    }

    // Guard clause for config
    if (!config.content.root) {
      return [];
    }

    // If no arrangements, return original files
    if (!arrangements || arrangements.length <= 0) {
      return files;
    }

    return arrangements?.reduce<IFiles[]>((acc, curr) => {
      if (curr.type === 'file' || curr.type === 'heading') {
        const name = curr.groupName;
        const type = curr.type;
        const { base, dir } = path.parse(curr.targetPath);
        return [
          ...acc,
          {
            name: name,
            ...(curr.type === 'file' && {
              realPath: `files/${curr.targetPath}`,
            }),
            children: [],
            isFile: type === 'file',
            path: curr.groupName
              ? `files/${path.join(dir, '../').replace('./', '')}${path.parse(dir).name}/${slugify(curr.groupName)}/${base}`
              : `files/${curr.targetPath}`,
            sha: null,
            type: type === 'heading' ? 'heading' : 'file',
          },
        ];
      } else if (curr.type === 'folder') {
        return [
          ...acc,
          {
            isFile: false,
            name: curr.groupName,
            path: `files/${curr.targetPath}/${slugify(curr.groupName)}`,
            sha: null,
          },
        ];
      }
      return acc;
    }, []);
  };

  let files = [] as IFiles[];

  if (isTreesLoaded) {
    files = folderList(trees![0].children!);
  }

  return (
    <>
      <title>{project?.project_name}</title>
      <BaseLayout
        config={config}
        dashboardMenu={dashboardMenu}
        navChildren={
          <>
            {files.length > 0 && (
              <ul className="tree bg-muted rounded px-3 py-1.5">
                <li>
                  <Accordion
                    className={cn('relative')}
                    defaultValue="config"
                    type="single"
                    collapsible
                  >
                    <AccordionItem className="border-0" value="config">
                      <div
                        className={cn('py-2.5 rounded  text-foreground w-full')}
                      >
                        <AccordionTrigger
                          className={cn(
                            'text-sm hover:no-underline [&[data-state=open]>svg]:rotate-0 justify-start space-x-2 p-0 h-auto w-full'
                          )}
                        >
                          <>
                            <Link
                              className="flex-1 space-x-2 text-left"
                              href={`/${params.orgId}/${params.projectId}/files/${config.content.root}`}
                            >
                              <FolderClosed className="inline-block size-5 stroke-[1.5]" />
                              <span
                                className={cn(
                                  'flex-1 text-left',
                                  config.content.root.includes('content') &&
                                    'capitalize'
                                )}
                              >
                                {path.basename(config.content.root)}
                              </span>
                            </Link>
                          </>
                        </AccordionTrigger>
                      </div>
                      <AccordionContent className="pb-0">
                        <ul>
                          <Suspense
                            fallback={Array.from(
                              { length: 6 },
                              (_, i) => (i = 1)
                            ).map((item) => {
                              return (
                                <li key={item} className="mb-3 last:mb-0">
                                  <Skeleton className="w-full h-3" />
                                </li>
                              );
                            })}
                          >
                            <RenderMenu
                              config={config}
                              files={files}
                              orgId={params.orgId.slice(4)}
                              projectId={params.projectId}
                            />
                          </Suspense>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </li>
              </ul>
            )}

            {config.themeConfig?.length > 0 && (
              <ul className="tree bg-muted rounded [--spacing:2rem] px-3 py-1.5">
                <li>
                  <Accordion
                    className={cn('relative')}
                    type="single"
                    collapsible
                  >
                    <AccordionItem className="border-0" value="config">
                      <NavLink
                        className={cn(
                          'flex items-center pr-0 py-2.5 rounded  text-foreground w-full'
                        )}
                        activeClassName="bg-background text-primary"
                        href={''}
                      >
                        <AccordionTrigger
                          className={cn(
                            'text-sm hover:no-underline  [&[data-state=open]>svg]:rotate-0 justify-start space-x-2 p-0 h-auto w-full'
                          )}
                        >
                          <>
                            <FileCog className="inline-block size-5 stroke-[1.5]" />
                            <span className="flex-1 text-left">Config</span>
                          </>
                        </AccordionTrigger>
                      </NavLink>

                      <AccordionContent>
                        <ul>
                          <RenderLink
                            config={config}
                            files={trees![2].children}
                            orgId={params.orgId.slice(4)}
                            projectId={params.projectId}
                          />
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </li>
              </ul>
            )}
          </>
        }
        orgId={params.orgId.slice(4)}
        orgs={orgs!}
        projectId={params.projectId}
      >
        {children}
      </BaseLayout>
    </>
  );
}
