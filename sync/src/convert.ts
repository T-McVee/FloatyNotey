export interface ConvertResult {
  markdown: string;
  linksTo: string[];
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  attrs?: Record<string, unknown>;
}

const REMOTE_LINK_RE = /#note\/r:([a-zA-Z0-9]+)$/;

export function tiptapJsonToMarkdown(doc: object): ConvertResult {
  const linksToSet = new Set<string>();
  const markdown = convertNode(doc as TiptapNode, linksToSet);
  return { markdown: markdown.trimEnd() + "\n", linksTo: [...linksToSet] };
}

function convertNode(node: TiptapNode, linksTo: Set<string>): string {
  switch (node.type) {
    case "doc":
      return convertChildren(node, linksTo, "\n\n");

    case "paragraph":
      return convertChildren(node, linksTo);

    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      const prefix = "#".repeat(level);
      return `${prefix} ${convertChildren(node, linksTo)}`;
    }

    case "text":
      return applyMarks(node.text ?? "", node.marks ?? [], linksTo);

    case "bulletList":
      return convertListItems(node, linksTo, "- ");

    case "orderedList":
      return convertListItems(node, linksTo, null);

    case "listItem":
      return convertChildren(node, linksTo, "\n");

    case "taskList":
      return convertTaskItems(node, linksTo);

    case "taskItem": {
      const checked = node.attrs?.checked ? "x" : " ";
      const content = convertChildren(node, linksTo, "\n");
      return `- [${checked}] ${content}`;
    }

    case "codeBlock": {
      const lang = (node.attrs?.language as string) ?? "";
      const code = node.content?.map((c) => c.text ?? "").join("") ?? "";
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }

    case "blockquote": {
      const inner = convertChildren(node, linksTo, "\n\n");
      return inner
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    }

    case "hardBreak":
      return "  \n";

    default:
      return node.content ? convertChildren(node, linksTo, "\n\n") : "";
  }
}

function convertChildren(
  node: TiptapNode,
  linksTo: Set<string>,
  separator = "",
): string {
  if (!node.content) return "";
  return node.content.map((child) => convertNode(child, linksTo)).join(separator);
}

function convertListItems(
  node: TiptapNode,
  linksTo: Set<string>,
  bullet: string | null,
): string {
  if (!node.content) return "";
  return node.content
    .map((item, i) => {
      const prefix = bullet ?? `${i + 1}. `;
      const content = convertChildren(item, linksTo, "\n");
      const lines = content.split("\n");
      const indent = " ".repeat(prefix.length);
      return lines
        .map((line, j) => (j === 0 ? `${prefix}${line}` : `${indent}${line}`))
        .join("\n");
    })
    .join("\n");
}

function convertTaskItems(
  node: TiptapNode,
  linksTo: Set<string>,
): string {
  if (!node.content) return "";
  return node.content.map((item) => convertNode(item, linksTo)).join("\n");
}

function applyMarks(
  text: string,
  marks: Array<{ type: string; attrs?: Record<string, unknown> }>,
  linksTo: Set<string>,
): string {
  let result = text;

  for (const mark of marks) {
    switch (mark.type) {
      case "bold":
        result = `**${result}**`;
        break;
      case "italic":
        result = `*${result}*`;
        break;
      case "strike":
        result = `~~${result}~~`;
        break;
      case "code":
        result = `\`${result}\``;
        break;
      case "link": {
        const href = (mark.attrs?.href as string) ?? "";
        const match = REMOTE_LINK_RE.exec(href);
        if (match) {
          const remoteId = match[1];
          linksTo.add(remoteId);
          result = `[${result}](./${remoteId}.md)`;
        } else {
          result = `[${result}](${href})`;
        }
        break;
      }
    }
  }

  return result;
}
