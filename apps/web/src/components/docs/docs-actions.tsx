import { Fragment } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowUpCircle } from "reicon-react/icons/ArrowUpCircle";
import { BookOpen } from "reicon-react/icons/BookOpen";
import { ChatRoundDots } from "reicon-react/icons/ChatRoundDots";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Copy3 } from "reicon-react/icons/Copy3";
import { DocumentDownload } from "reicon-react/icons/DocumentDownload";
import { Edit } from "reicon-react/icons/Edit";
import { Export } from "reicon-react/icons/Export";
import { Plug } from "reicon-react/icons/Plug";

import {
  ChatGptIcon,
  ClaudeCodeIcon,
  ClaudeIcon,
  CodexIcon,
  CursorIcon,
  GeminiIcon,
  GrokIcon,
  PerplexityIcon,
  SciraIcon,
  T3ChatIcon,
  V0Icon,
  VsCodeIcon,
} from "@/components/docs/brand-icons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LINK } from "@/constants/links";
import { MCP_RESOURCE } from "@/constants/oauth";
import { docsMarkdownPath } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { buildDocsEpub } from "@/lib/docs-epub";
import { cn } from "@/lib/utils";

const EDIT_BASE = `${LINK.GITHUB_REPO}/edit/main/apps/web/content/docs`;
const MCP_NAME = "motionvideo";

// Assistants that open a new chat with a prompt from the URL.
const CHATS = [
  { name: "v0", url: "https://v0.dev/chat?q=", Icon: V0Icon },
  {
    name: "Cursor",
    url: "https://cursor.com/link/prompt?text=",
    Icon: CursorIcon,
  },
  {
    name: "ChatGPT",
    url: "https://chatgpt.com/?hints=search&q=",
    Icon: ChatGptIcon,
  },
  { name: "Claude", url: "https://claude.ai/new?q=", Icon: ClaudeIcon },
  {
    name: "Perplexity",
    url: "https://www.perplexity.ai/search?q=",
    Icon: PerplexityIcon,
  },
  {
    name: "Gemini",
    url: "https://gemini.google.com/app?q=",
    Icon: GeminiIcon,
  },
  { name: "Grok", url: "https://grok.com/?q=", Icon: GrokIcon },
  { name: "T3 Chat", url: "https://t3.chat/new?q=", Icon: T3ChatIcon },
  { name: "Scira", url: "https://scira.ai/?q=", Icon: SciraIcon },
] as const;

const CURSOR_INSTALL = `https://cursor.com/install-mcp?name=${MCP_NAME}&config=${btoa(
  JSON.stringify({ url: MCP_RESOURCE })
)}`;
const VS_CODE_INSTALL = `vscode:mcp/install?${encodeURIComponent(
  JSON.stringify({ name: MCP_NAME, type: "http", url: MCP_RESOURCE })
)}`;
const CLAUDE_CODE_COMMAND = `claude mcp add --transport http ${MCP_NAME} ${MCP_RESOURCE}`;
const CODEX_COMMAND = `codex mcp add ${MCP_NAME} --url ${MCP_RESOURCE}`;

// No horizontal padding or hover fill: the icons line up with the "On this
// page" heading and the contents' rule above them.
const actionClass =
  "text-muted-foreground hover:text-foreground data-popup-open:text-foreground focus-visible:ring-ring flex h-8 w-full items-center gap-2 rounded-sm text-left text-sm transition-colors outline-none focus-visible:ring-2 [&_svg]:size-4 [&_svg]:shrink-0";

interface MenuEntry {
  key: string;
  icon: ReactNode;
  label: ReactNode;
  /** A link (opened in a new tab unless `sameTab`), or else `handleSelect`. */
  href?: string;
  sameTab?: boolean;
  handleSelect?: () => void;
  /** A rule above this entry, starting a new group. */
  separated?: boolean;
}

/**
 * One action with a submenu (Export, Open in chat, Connect to MCP). A
 * dropdown in the desktop column; `inline` (the mobile "On this page") opens
 * the entries in the flow below it, indented behind a left rule.
 */
const MenuAction = ({
  icon,
  label,
  entries,
  inline,
}: {
  icon: ReactNode;
  label: ReactNode;
  entries: MenuEntry[];
  inline: boolean;
}) => {
  const trigger = (
    <>
      {icon}
      {label}
      <ChevronDown
        aria-hidden="true"
        className="ml-auto transition-transform in-aria-expanded:rotate-180 in-data-popup-open:rotate-180"
      />
    </>
  );
  if (inline) {
    return (
      <Collapsible>
        <CollapsibleTrigger className={actionClass}>
          {trigger}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="ml-2 flex flex-col gap-0.5 border-l py-1 pl-3">
            {entries.map((entry) => (
              <li
                key={entry.key}
                className={cn(entry.separated && "mt-1 border-t pt-1")}
              >
                {entry.href ? (
                  <a
                    href={entry.href}
                    {...(entry.sameTab
                      ? {}
                      : { target: "_blank", rel: "noreferrer" })}
                    className={actionClass}
                  >
                    {entry.icon}
                    {entry.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    className={actionClass}
                    onClick={entry.handleSelect}
                  >
                    {entry.icon}
                    {entry.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={actionClass}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {entries.map((entry) => (
          <Fragment key={entry.key}>
            {entry.separated && <DropdownMenuSeparator />}
            {entry.href ? (
              <DropdownMenuLinkItem
                href={entry.href}
                {...(entry.sameTab
                  ? {}
                  : { target: "_blank", rel: "noreferrer" })}
              >
                {entry.icon}
                {entry.label}
              </DropdownMenuLinkItem>
            ) : (
              <DropdownMenuItem onClick={entry.handleSelect}>
                {entry.icon}
                {entry.label}
              </DropdownMenuItem>
            )}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

type CopyStatus = "idle" | "copied" | "failed";

export interface DocsActionsProps {
  title: string;
  description: string;
  /** Page path, e.g. /docs/mcp. */
  url: string;
  /** Content path of the MDX file, e.g. `mcp.mdx`, for the edit link. */
  path: string;
  /** Language of the shown page, for the EPUB. */
  lang: string;
  /** The rendered article body, for the EPUB. */
  getArticle: () => HTMLElement | null;
  /** Submenus open in the flow instead of as dropdowns (mobile panel). */
  inline?: boolean;
}

/**
 * Edit, scroll to top, copy as Markdown, export (PDF via the print dialog,
 * EPUB built in the browser), open in an assistant and connect the MCP
 * server. Under the table of contents, and in the mobile "On this page".
 */
export const DocsActions = ({
  title,
  description,
  url,
  path,
  lang,
  getArticle,
  inline = false,
}: DocsActionsProps) => {
  const content = useIntlayer("docs-layout");
  const [markdownStatus, flashMarkdown] =
    useTransientStatus<CopyStatus>("idle");
  const [mcpStatus, flashMcp] = useTransientStatus<CopyStatus>("idle");
  const statusLabel = (status: CopyStatus, idle: ReactNode) => {
    if (status === "copied") {
      return content.copied;
    }
    return status === "failed" ? content.copyFailed : idle;
  };

  // Copied from this origin (localhost, previews and the live site alike);
  // assistants get the public URL.
  const markdownPath = docsMarkdownPath(url);
  const chatPrompt = encodeURIComponent(
    `Read ${absoluteUrl(markdownPath)}, I want to ask questions about it.`
  );

  const fetchMarkdown = async () => {
    const response = await fetch(markdownPath);
    if (!response.ok) {
      throw new Error(`Markdown ${response.status}`);
    }
    return response.text();
  };

  const copyMarkdown = async () => {
    try {
      // A ClipboardItem with a pending blob keeps the click's user activation
      // through the fetch (Safari drops it after an await); without
      // ClipboardItem, write the text once it arrives.
      await (typeof ClipboardItem === "undefined"
        ? fetchMarkdown().then((text) => navigator.clipboard.writeText(text))
        : navigator.clipboard.write([
            new ClipboardItem({
              "text/plain": fetchMarkdown().then(
                (text) => new Blob([text], { type: "text/plain" })
              ),
            }),
          ]));
      flashMarkdown("copied");
    } catch {
      flashMarkdown("failed");
    }
  };

  const copyMcp = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flashMcp("copied");
    } catch {
      flashMcp("failed");
    }
  };

  const exportEpub = () => {
    const article = getArticle();
    if (!article) {
      return;
    }
    const blob = buildDocsEpub({
      title,
      description,
      url: absoluteUrl(url),
      lang,
      article,
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `motionvideo-${url.split("/").at(-1) ?? "docs"}.epub`;
    link.click();
    // After the click has handed the file to the download.
    setTimeout(() => URL.revokeObjectURL(link.href), 0);
  };

  return (
    <nav
      aria-label={content.pageActions.value}
      className="flex flex-col gap-0.5 print:hidden"
    >
      <a
        href={`${EDIT_BASE}/${path}`}
        target="_blank"
        rel="noreferrer"
        className={actionClass}
      >
        <Edit aria-hidden="true" />
        {content.editPage}
        <span className="sr-only"> {content.opensInNewTab}</span>
      </a>
      <button
        type="button"
        className={actionClass}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          })
        }
      >
        <ArrowUpCircle aria-hidden="true" />
        {content.scrollToTop}
      </button>
      <button type="button" className={actionClass} onClick={copyMarkdown}>
        <Copy3 aria-hidden="true" />
        <span aria-live="polite">
          {statusLabel(markdownStatus, content.copyMarkdown)}
        </span>
      </button>
      <MenuAction
        inline={inline}
        icon={<Export aria-hidden="true" />}
        label={content.exportPage}
        entries={[
          {
            key: "pdf",
            icon: <DocumentDownload aria-hidden="true" />,
            label: content.exportPdf,
            handleSelect: () => window.print(),
          },
          {
            key: "epub",
            icon: <BookOpen aria-hidden="true" />,
            label: content.exportEpub,
            handleSelect: exportEpub,
          },
        ]}
      />
      <MenuAction
        inline={inline}
        icon={<ChatRoundDots aria-hidden="true" />}
        label={content.openInChat}
        entries={CHATS.map((chat) => ({
          key: chat.name,
          icon: <chat.Icon />,
          label: content.openIn({ name: chat.name }),
          href: `${chat.url}${chatPrompt}`,
        }))}
      />
      <MenuAction
        inline={inline}
        icon={<Plug aria-hidden="true" />}
        label={
          <span aria-live="polite">
            {statusLabel(mcpStatus, content.connectMcp)}
          </span>
        }
        entries={[
          {
            key: "url",
            icon: <Copy3 aria-hidden="true" />,
            label: content.copyServerUrl,
            handleSelect: () => copyMcp(MCP_RESOURCE),
          },
          {
            key: "claude-code",
            icon: <ClaudeCodeIcon />,
            label: content.copyClaudeCode,
            handleSelect: () => copyMcp(CLAUDE_CODE_COMMAND),
          },
          {
            key: "codex",
            icon: <CodexIcon />,
            label: content.copyCodex,
            handleSelect: () => copyMcp(CODEX_COMMAND),
          },
          {
            key: "cursor",
            icon: <CursorIcon />,
            label: content.addToCursor,
            href: CURSOR_INSTALL,
            separated: true,
          },
          {
            key: "vscode",
            icon: <VsCodeIcon />,
            label: content.addToVsCode,
            href: VS_CODE_INSTALL,
            sameTab: true,
          },
        ]}
      />
    </nav>
  );
};
