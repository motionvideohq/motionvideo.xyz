import type { ReactElement } from "react";
import { File } from "reicon-react/icons/File";
import { FileZip } from "reicon-react/icons/FileZip";

const FILE_MARK_BOX = { size: 72, radius: 8 } as const;

const FileBadge = ({
  fill,
  paths,
}: {
  fill: string;
  paths: readonly string[];
}) => (
  <svg
    viewBox={`0 0 ${String(FILE_MARK_BOX.size)} ${String(FILE_MARK_BOX.size)}`}
    className="size-1/2"
    aria-hidden
  >
    <rect
      width={FILE_MARK_BOX.size}
      height={FILE_MARK_BOX.size}
      rx={FILE_MARK_BOX.radius}
      fill={fill}
    />
    {paths.map((d) => (
      <path key={d} d={d} fill="#fff" fillRule="evenodd" />
    ))}
  </svg>
);

const FILE_MARK_ART = {
  pdf: {
    fill: "#DB4437",
    paths: [
      "M11 48.2009H15.5485V37.9976H21.4492C22.7604 37.9976 23.8463 37.5674 24.7069 36.7069C25.5674 35.8463 25.9976 34.7604 25.9976 33.4492V27.5485C25.9976 26.2372 25.5674 25.1513 24.7069 24.2908C23.8463 23.4303 22.7604 23 21.4492 23H11V48.2009ZM15.548 33.4487V27.548H21.4487V33.4487H15.548Z",
      "M30.4066 48.2009H40.7329C41.9622 48.2009 43.0276 47.7707 43.9291 46.9102C44.8306 46.0496 45.2813 44.9637 45.2813 43.6525V27.5485C45.2813 26.2372 44.8306 25.1513 43.9291 24.2908C43.0276 23.4303 41.9622 23 40.7329 23H30.4066V48.2009ZM34.9551 27.5479V43.6519H40.7329V27.5479H34.9551Z",
      "M54.8534 48.2009H50.305V23H61V27.5485H54.8534V33.4492H61V37.9976H54.8534V48.2009Z",
    ],
  },
  doc: {
    fill: "#4688F4",
    paths: [
      "M12.2031 16L21.2597 56H28.6027L36.0007 27.8879L43.3986 56H50.739L59.7956 16H52.6184L46.3556 43.6606L39.1028 16.0998L39.1291 16H32.8723L32.8985 16.0998L25.6443 43.6659L19.3803 16H12.2031Z",
    ],
  },
  slides: {
    fill: "#FF773E",
    paths: [
      "M39 16H21V56H28V42H39C46.1797 42 52 36.1797 52 29C52 21.8203 46.1797 16 39 16ZM38 22H28V36H38C41.866 36 45 32.866 45 29C45 25.134 41.866 22 38 22Z",
    ],
  },
  sheet: {
    fill: "#0F9D58",
    paths: [
      "M31.8919 36.0694L19.0171 16H27.3337L36.1672 29.77L45.5127 16H53.9727L40.2781 36.178L52.9941 56H44.6775L36.0027 42.4775L26.8252 56H18.3652L31.8919 36.0694Z",
    ],
  },
} as const;

const FILE_MARKS = {
  pdf: <FileBadge {...FILE_MARK_ART.pdf} />,
  doc: <FileBadge {...FILE_MARK_ART.doc} />,
  slides: <FileBadge {...FILE_MARK_ART.slides} />,
  sheet: <FileBadge {...FILE_MARK_ART.sheet} />,
} as const;

const MARKED_EXTENSIONS = {
  pdf: ["pdf"],
  doc: ["doc", "docx", "odt", "rtf", "pages"],
  slides: ["ppt", "pptx", "key", "odp"],
  sheet: ["xls", "xlsx", "csv", "numbers", "ods"],
  zip: ["zip"],
} as const;

type MarkedKind = keyof typeof MARKED_EXTENSIONS;

// SAFETY: MARKED_EXTENSIONS is a closed object; its keys are exactly MarkedKind.
const MARKED_KINDS = Object.keys(MARKED_EXTENSIONS) as MarkedKind[];

const extensionsOf = (kind: MarkedKind): readonly string[] =>
  MARKED_EXTENSIONS[kind];

const extensionOf = (name: string) => name.toLowerCase().split(".").pop() ?? "";

const markKindOf = (file: File): MarkedKind | "image" | "file" => {
  const ext = extensionOf(file.name);
  if (file.type.startsWith("image/")) {
    return "image";
  }
  if (file.type === "application/pdf") {
    return "pdf";
  }

  const marked = MARKED_KINDS.find((kind) => extensionsOf(kind).includes(ext));
  if (marked) {
    return marked;
  }
  if (file.type.includes("zip")) {
    return "zip";
  }
  return "file";
};

const markOfExtension = (extension: string): MarkedKind | undefined =>
  MARKED_KINDS.find((kind) => extensionsOf(kind).includes(extension));

const fileMarkFor = (file: File): ReactElement | null => {
  const kind = markKindOf(file);
  if (kind === "image") {
    return null;
  }
  if (kind === "zip") {
    return <FileZip strokeWidth={1.8} aria-hidden />;
  }
  if (kind === "file") {
    return <File strokeWidth={1.8} aria-hidden />;
  }
  return FILE_MARKS[kind];
};

const fileColorFor = (file: File): string | null => {
  const kind = markKindOf(file);
  return kind === "image" || kind === "zip" || kind === "file"
    ? null
    : FILE_MARK_ART[kind].fill;
};

export {
  FileBadge,
  FILE_MARK_ART,
  FILE_MARK_BOX,
  FILE_MARKS,
  fileColorFor,
  fileMarkFor,
  markOfExtension,
  MARKED_EXTENSIONS,
  type MarkedKind,
};
