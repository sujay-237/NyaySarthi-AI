import { type Language, type Provider } from "../types";
import { t } from "../utils/i18n";

interface ProviderSelectorProps {
  language: Language;
  provider: Provider;
  setProvider: (p: Provider) => void;
  model: string | null;
  setModel: (m: string | null) => void;
  providers: { id: Provider; name: string; models: string[]; available: boolean }[];
}

export default function ProviderSelector({
  language,
  provider,
  setProvider,
  model,
  setModel,
  providers,
}: ProviderSelectorProps) {
  const selectedProvider = providers.find((p) => p.id === provider);
  const models = selectedProvider?.models || [];

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-2">
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {t(language, "providerLabel")}
        </label>
        <select
          value={provider}
          onChange={(e) => {
            const p = e.target.value as Provider;
            setProvider(p);
            const prov = providers.find((pr) => pr.id === p);
            if (prov && prov.models.length > 0) setModel(prov.models[0]);
          }}
          className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700/50 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 p-2 transition"
        >
          <option value="" disabled>{t(language, "selectProvider")}</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id} disabled={!p.available}>
              {p.name} {!p.available ? "(Unavailable)" : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          {t(language, "modelLabel")}
        </label>
        <select
          value={model || ""}
          onChange={(e) => setModel(e.target.value || null)}
          className="w-full bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700/50 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 p-2 transition"
        >
          <option value="" disabled>{t(language, "selectModel")}</option>
          {models.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
