import { useState } from "react";
import { Copy, Share2, FileDown, FileText, Check } from "lucide-react";
import { type Language } from "../types";
import { t } from "../utils/i18n";
import { exportToMarkdown, exportToText, copyToClipboard, downloadFile } from "../utils/exporters";

interface ExportButtonsProps {
  result: any;
  language: Language;
}

export default function ExportButtons({ result, language }: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = exportToText(result);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const subject = "NyaySarthi AI Analysis Report";
    const body = exportToText(result);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(result);
    downloadFile(md, "analysis-report.md", "text/markdown");
  };

  const handleExportText = () => {
    const text = exportToText(result);
    downloadFile(text, "analysis-report.txt", "text/plain");
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleCopy}
        title={t(language, "copyReport")}
        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
      </button>
      <button
        onClick={handleShare}
        title={t(language, "emailReport")}
        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        onClick={handleExportMarkdown}
        title={t(language, "exportMarkdown")}
        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        <FileDown className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        onClick={handleExportText}
        title={t(language, "exportPDF")}
        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
}
