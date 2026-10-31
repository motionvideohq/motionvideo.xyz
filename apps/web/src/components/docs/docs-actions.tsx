import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowUp } from "reicon-react/icons/ArrowUp";
import { ChatRoundDots } from "reicon-react/icons/ChatRoundDots";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Copy3 } from "reicon-react/icons/Copy3";
import { Edit } from "reicon-react/icons/Edit";
import { Export } from "reicon-react/icons/Export";
import { Plug } from "reicon-react/icons/Plug";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LINK } from "@/constants/links";
import { MCP_RESOURCE } from "@/constants/oauth";
import { ROUTES } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { buildDocsEpub } from "@/lib/docs-epub";

const EDIT_BASE = `${LINK.GITHUB_REPO}/edit/main/apps/web/content/docs`;
const MCP_NAME = "motionvideo";

// Assistants that open a new chat with a prompt from the URL.
const CHATS = [
  { name: "v0", url: "https://v0.dev/chat?q=" },
  { name: "ChatGPT", url: "https://chatgpt.com/?hints=search&q=" },
  { name: "Claude", url: "https://claude.ai/new?q=" },
  { name: "T3 Chat", url: "https://t3.chat/new?q=" },
  { name: "Scira", url: "https://scira.ai/?q=" },
  { name: "Cursor", url: "https://cursor.com/link/prompt?text=" },
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

const MenuAction = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: ReactNode;
  children: ReactNode;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger className={actionClass}>
      {icon}
      {label}
      <ChevronDown
        aria-hidden="true"
        className="ml-auto transition-transform in-data-popup-open:rotate-180"
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start" className="w-56">
      {children}
    </DropdownMenuContent>
  </DropdownMenu>
);

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

  const markdownUrl = absoluteUrl(
    `${ROUTES.DOCS_MARKDOWN}${url.slice(ROUTES.DOCS.length)}`
  );
  const chatPrompt = encodeURIComponent(
    `Read ${markdownUrl}, I want to ask questions about it.`
  );

  const copyMarkdown = async () => {
    try {
      // A ClipboardItem with a pending blob keeps the click's user activation
      // through the fetch (Safari drops it after an await).
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/plain": fetch(markdownUrl).then(async (response) => {
            if (!response.ok) {
              throw new Error(`Markdown ${response.status}`);
            }
            return new Blob([await response.text()], { type: "text/plain" });
          }),
        }),
      ]);
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
        <ArrowUp aria-hidden="true" />
        {content.scrollToTop}
      </button>
      <button type="button" className={actionClass} onClick={copyMarkdown}>
        <Copy3 aria-hidden="true" />
        <span aria-live="polite">
          {statusLabel(markdownStatus, content.copyMarkdown)}
        </span>
      </button>
      <MenuAction
        icon={<Export aria-hidden="true" />}
        label={content.exportPage}
      >
        <DropdownMenuItem onClick={() => window.print()}>PDF</DropdownMenuItem>
        <DropdownMenuItem onClick={exportEpub}>EPUB</DropdownMenuItem>
      </MenuAction>
      <MenuAction
        icon={<ChatRoundDots aria-hidden="true" />}
        label={content.openInChat}
      >
        {CHATS.map((chat) => (
          <DropdownMenuLinkItem
            key={chat.name}
            href={`${chat.url}${chatPrompt}`}
            target="_blank"
            rel="noreferrer"
          >
            {chat.name}
          </DropdownMenuLinkItem>
        ))}
      </MenuAction>
      <MenuAction
        icon={<Plug aria-hidden="true" />}
        label={
          <span aria-live="polite">
            {statusLabel(mcpStatus, content.connectMcp)}
          </span>
        }
      >
        <DropdownMenuItem onClick={() => copyMcp(MCP_RESOURCE)}>
          {content.copyServerUrl}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyMcp(CLAUDE_CODE_COMMAND)}>
          {content.copyClaudeCode}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyMcp(CODEX_COMMAND)}>
          {content.copyCodex}
        </DropdownMenuItem>
        <DropdownMenuLinkItem
          href={CURSOR_INSTALL}
          target="_blank"
          rel="noreferrer"
        >
          {content.addToCursor}
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem href={VS_CODE_INSTALL}>
          {content.addToVsCode}
        </DropdownMenuLinkItem>
      </MenuAction>
    </nav>
  );
};
