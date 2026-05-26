import { useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { pricingData, allSections, type PricingSection } from "@/data/pricingData";

const priceRanges = [
  { label: "Under R200", min: 0, max: 200 },
  { label: "R200–R500", min: 200, max: 500 },
  { label: "R500+", min: 500, max: Infinity },
];

const parsePrice = (price: string): number => {
  return parseInt(price.replace(/[R,]/g, ""), 10) || 0;
};

// Only show sections that have priced items
const pricedSections = allSections.filter((s) =>
  pricingData[s.key].categories.some((cat) => cat.items.length > 0)
);

const tabLabels: Record<string, string> = {};
pricedSections.forEach((s) => {
  tabLabels[s.key] = s.label;
});

const HighlightText = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm px-0.5 text-inherit" style={{ background: "rgba(180,120,60,0.2)" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

const PricingList = ({ data }: { data: PricingSection }) => (
  <div className="space-y-6">
    {data.categories.map((category, idx) => (
      <div key={idx}>
        <h4 className="font-semibold text-gray-900 mb-3">{category.name}</h4>
        {category.items.length === 0 ? (
          <p className="text-sm text-gray-400 italic py-2">Prices coming soon</p>
        ) : (
          <div className="space-y-2">
            {category.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-semibold" style={{ color: "#b47838" }}>{item.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);

export const PricingPreview = () => {
  const [search, setSearch] = useState("");
  const defaultTab = pricedSections[0]?.key || "barber";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);

  const filteredData = useMemo(() => {
    const q = search.toLowerCase().trim();
    const result: Record<string, PricingSection> = {};

    for (const [key, section] of Object.entries(pricingData)) {
      // Skip sections with no priced items for filtering
      if (!section.categories.some((cat) => cat.items.length > 0)) continue;

      const filteredCats = section.categories
        .map((cat) => ({
          ...cat,
          items: cat.items.filter((item) => {
            const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.price.toLowerCase().includes(q);
            const matchesRange = !priceRange || (parsePrice(item.price) >= priceRange.min && parsePrice(item.price) < priceRange.max);
            return matchesSearch && matchesRange;
          }),
        }))
        .filter((cat) => cat.items.length > 0);
      if (filteredCats.length > 0) {
        result[key] = { ...section, categories: filteredCats };
      }
    }
    return result;
  }, [search, priceRange]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const [key, section] of Object.entries(filteredData)) {
      counts[key] = section.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    }
    return counts;
  }, [filteredData]);

  const totalResults = useMemo(
    () => Object.values(tabCounts).reduce((a, b) => a + b, 0),
    [tabCounts]
  );

  const isFiltering = search.trim() !== "" || priceRange !== null;

  useEffect(() => {
    if (isFiltering && !filteredData[activeTab]) {
      const firstKey = Object.keys(filteredData)[0];
      if (firstKey) setActiveTab(firstKey);
    }
  }, [filteredData, activeTab, isFiltering]);

  const clearAll = useCallback(() => {
    setSearch("");
    setPriceRange(null);
    setActiveTab(defaultTab);
  }, [defaultTab]);

  return (
    <section
      id="pricing"
      className="py-24 px-6"
      style={{
        background: "linear-gradient(180deg, rgba(250,245,239,0.5) 0%, #ffffff 100%)",
      }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
          <p className="text-lg text-gray-600">Browse our services and prices. No hidden fees, no surprises.</p>

          <div className="relative max-w-md mx-auto mt-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services or prices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Sparkles className="h-3.5 w-3.5" style={{ color: "#b47838" }} />
            <span className="text-xs text-muted-foreground mr-1">Quick filter:</span>
            {priceRanges.map((range) => (
              <button
                key={range.label}
                onClick={() =>
                  setPriceRange(
                    priceRange?.min === range.min && priceRange?.max === range.max ? null : { min: range.min, max: range.max }
                  )
                }
                className="text-xs px-3 py-1 rounded-full border transition-all"
                style={
                  priceRange?.min === range.min && priceRange?.max === range.max
                    ? { background: "#b47838", color: "#fff", borderColor: "#b47838" }
                    : { borderColor: "rgba(180,120,60,0.3)", color: "#9a6830" }
                }
              >
                {range.label}
              </button>
            ))}
            {isFiltering && (
              <button
                onClick={clearAll}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
              >
                Clear all
              </button>
            )}
          </div>

          {isFiltering && (
            <p className="text-sm text-muted-foreground mt-3 animate-in fade-in">
              {totalResults === 0
                ? "No services found — try a different search"
                : `${totalResults} service${totalResults !== 1 ? "s" : ""} found across ${Object.keys(filteredData).length} category${Object.keys(filteredData).length !== 1 ? "ies" : "y"}`}
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full mb-8`}
            style={{ background: "rgba(180,120,60,0.08)", gridTemplateColumns: `repeat(${pricedSections.length}, 1fr)` }}
          >
            {pricedSections.map(({ key }) => {
              const count = tabCounts[key] || 0;
              const hasResults = count > 0;
              return (
                <TabsTrigger
                  key={key}
                  value={key}
                  disabled={isFiltering && !hasResults}
                  className={`relative transition-opacity ${isFiltering && !hasResults ? "opacity-40" : ""}`}
                  data-accent="#b47838"
                >
                  {tabLabels[key]}
                  {isFiltering && hasResults && (
                    <Badge
                      variant="secondary"
                      className="ml-1.5 h-4 min-w-4 px-1 text-[10px] leading-none"
                      style={{ background: "rgba(180,120,60,0.15)", color: "#9a6830" }}
                    >
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(filteredData).map(([key, data]) => (
            <TabsContent
              key={key}
              value={key}
              className="bg-white rounded-2xl p-6 shadow-sm"
              style={{ border: "1px solid rgba(180,120,60,0.12)" }}
            >
              <div className="grid gap-6 md:grid-cols-2">
                {data.categories.slice(0, 2).map((category, idx) => (
                  <div key={idx}>
                    <h4 className="font-semibold text-gray-900 mb-3">{category.name}</h4>
                    <div className="space-y-2">
                      {category.items.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-600">
                            <HighlightText text={item.name} query={search.trim()} />
                          </span>
                          <span className="font-semibold" style={{ color: "#b47838" }}>
                            <HighlightText text={item.price} query={search.trim()} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}

          {isFiltering && !filteredData[activeTab] && totalResults === 0 && (
            <div
              className="bg-white rounded-2xl p-12 shadow-sm text-center"
              style={{ border: "1px solid rgba(180,120,60,0.12)" }}
            >
              <Search className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No services match your filters</p>
              <button onClick={clearAll} className="text-sm mt-2 underline hover:no-underline" style={{ color: "#b47838" }}>
                Clear filters
              </button>
            </div>
          )}
        </Tabs>

        <div className="text-center mt-8">
          <Link to="/pricing">
            <Button
              variant="outline"
              className="hover:bg-orange-50/50"
              style={{ borderColor: "rgba(180,120,60,0.35)", color: "#9a6830" }}
            >
              View Full Price List
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">Prices subject to change</p>
        </div>
      </div>
    </section>
  );
};
