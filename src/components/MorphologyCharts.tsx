import { useEffect, useState } from "react";
import { MORPHOLOGY_CHARTS } from "../data/morphologyCharts";

type ChartKey = keyof typeof MORPHOLOGY_CHARTS;

const HEBREW = /[\u0590-\u05ff]/;

export function MorphologyCharts({ initialChart }: { initialChart?: string }) {
  const [activeChart, setActiveChart] = useState<string>(initialChart ?? "");

  useEffect(() => {
    if (initialChart) setActiveChart(initialChart);
  }, [initialChart]);

  const charts = (Object.keys(MORPHOLOGY_CHARTS) as ChartKey[]).map((key) => ({
    key,
    label: MORPHOLOGY_CHARTS[key].title,
  }));

  const currentChart =
    MORPHOLOGY_CHARTS[activeChart as ChartKey] ?? MORPHOLOGY_CHARTS[charts[0].key];

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <nav className="sm:w-36 sm:shrink-0">
        <ul className="flex sm:flex-col gap-1 overflow-x-auto">
          {charts.map((chart) => (
            <li key={chart.key}>
              <button
                type="button"
                onClick={() => setActiveChart(chart.key)}
                className={`w-full text-left px-2 py-2 rounded-sm text-sm transition-colors ${
                  activeChart === chart.key
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                {chart.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content area */}
      <div className="flex-1 min-w-0">
        <h3 className="text-2xl font-bold mb-6 text-slate-800">{currentChart.title}</h3>
        <div className="space-y-8">
          {currentChart.tables.map((table) => (
            <div key={table.subtitle ?? table.headers.join("|")}>
              {table.subtitle && (
                <h4 className="text-lg font-semibold text-slate-700 mb-3">{table.subtitle}</h4>
              )}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      {table.headers.map((header) => (
                        <th
                          key={header}
                          className="border border-slate-300 px-4 py-2 text-left font-semibold text-slate-700"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => (
                      <tr key={row[0]} className="hover:bg-slate-50">
                        {row.map((cell, cIdx) => {
                          const hebrew = cIdx > 0 && HEBREW.test(cell);
                          return (
                            <td
                              key={table.headers[cIdx]}
                              dir={hebrew ? "rtl" : undefined}
                              className={`border border-slate-300 px-2 py-2 ${
                                cIdx === 0
                                  ? "font-medium text-slate-700"
                                  : hebrew
                                    ? "text-slate-800 font-hebrew whitespace-nowrap"
                                    : "text-slate-800"
                              }`}
                            >
                              {cell}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
