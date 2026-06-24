export function exportToMarkdown(result: any): string {
  let md = `# Analysis Report - NyaySarthi AI\n\n`;
  md += `## Contract Health: ${result.health?.rating || "N/A"}\n`;
  md += `${result.health?.justification || ""}\n\n`;
  if (result.next_steps?.length) {
    md += `## Actionable Next Steps\n`;
    result.next_steps.forEach((step: string) => {
      md += `- ${step}\n`;
    });
    md += `\n`;
  }
  md += `## Summary\n${result.summary || "No summary available."}\n\n`;
  if (result.clauses?.length) {
    md += `## Key Clauses\n`;
    result.clauses.forEach((clause: any) => {
      md += `### ${clause.title} [${clause.severity}]\n`;
      md += `${clause.explanation}\n\n`;
    });
  }
  return md;
}

export function exportToText(result: any): string {
  let text = "ANALYSIS REPORT - NyaySarthi AI\n============================\n\n";
  text += `CONTRACT HEALTH: ${result.health?.rating || "N/A"}\n${result.health?.justification || ""}\n\n`;
  if (result.next_steps?.length) {
    text += "ACTIONABLE NEXT STEPS:\n";
    result.next_steps.forEach((step: string) => {
      text += `- ${step}\n`;
    });
    text += "\n";
  }
  text += `SUMMARY:\n${result.summary || "No summary available."}\n\n`;
  if (result.clauses?.length) {
    text += "KEY CLAUSES:\n";
    result.clauses.forEach((clause: any) => {
      text += `\n[${clause.severity}] ${clause.title}\n${clause.explanation}\n`;
    });
  }
  return text;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function shareViaEmail(subject: string, body: string): void {
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
