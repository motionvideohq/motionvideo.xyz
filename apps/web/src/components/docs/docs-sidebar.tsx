import { Link } from "@tanstack/react-router";
import type * as PageTree from "fumadocs-core/page-tree";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

interface NavSection {
  id: string;
  title?: ReactNode;
  items: PageTree.Item[];
}

// meta.json separators ("---Get started---") open a new titled section;
// folders contribute their index page and children in order.
const toSections = (nodes: PageTree.Node[]) => {
  const sections: NavSection[] = [{ id: "root", items: [] }];
  const collect = (list: PageTree.Node[]) => {
    for (const node of list) {
      if (node.type === "separator") {
        sections.push({
          id: node.$id ?? `separator-${sections.length}`,
          title: node.name,
          items: [],
        });
      } else if (node.type === "folder") {
        if (node.index) {
          sections.at(-1)?.items.push(node.index);
        }
        collect(node.children);
      } else {
        sections.at(-1)?.items.push(node);
      }
    }
  };
  collect(nodes);
  return sections.filter((section) => section.items.length > 0);
};

const DocsNav = ({ tree }: { tree: PageTree.Root }) => (
  <div className="flex flex-col gap-6">
    {toSections(tree.children).map((section) => (
      <div key={section.id} className="flex flex-col gap-1">
        {section.title ? (
          <p className="text-muted-foreground px-2.5 text-xs font-medium">
            {section.title}
          </p>
        ) : null}
        <ul className="flex flex-col gap-0.5">
          {section.items.map((item) => (
            <li key={item.url}>
              <Link
                to={item.url}
                activeOptions={{ exact: true, includeHash: false }}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/60 aria-[current=page]:bg-muted aria-[current=page]:text-foreground focus-visible:ring-ring block rounded-lg px-2.5 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 aria-[current=page]:font-medium"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

/** Page list in the left column (lg and up). */
export const DocsSidebar = ({ tree }: { tree: PageTree.Root }) => {
  const content = useIntlayer("docs-layout");
  return (
    <nav aria-label={content.navigation.value}>
      <DocsNav tree={tree} />
    </nav>
  );
};
