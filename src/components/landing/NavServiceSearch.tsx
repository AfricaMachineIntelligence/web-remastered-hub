import { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthGateModal } from "./AuthGateModal";
import { allPricedItems, allSections, type FlatPricingItem } from "@/data/pricingData";

type PriceRange = "all" | "under200" | "200to500" | "over500";
type SectionFilter = "all" | string;

const priceRanges: { value: PriceRange; label: string }[] = [
  { value: "all", label: "All prices" },
  { value: "under200", label: "Under R200" },
  { value: "200to500", label: "R200–R500" },
  { value: "over500", label: "R500+" },
];

const filterByPrice = (item: FlatPricingItem, range: PriceRange) => {
  if (range === "all") return true;
  if (range === "under200") return item.cents < 20000;
  if (range === "200to500") return item.cents >= 20000 && item.cents <= 50000;
  return item.cents > 50000;
};

export const NavServiceSearch = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [authGateOpen, setAuthGateOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return allPricedItems
      .filter((item) => {
        if (q && !(item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.section.toLowerCase().includes(q) || item.price.toLowerCase().includes(q)))
          return false;
        if (sectionFilter !== "all" && item.sectionKey !== sectionFilter) return false;
        if (!filterByPrice(item, priceRange)) return false;
        return true;
      })
      .slice(0, 12);
  }, [query, priceRange, sectionFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, FlatPricingItem[]>();
    results.forEach((r) => {
      const list = map.get(r.section) || [];
      list.push(r);
      map.set(r.section, list);
    });
    return map;
  }, [results]);

  const hasActiveFilters = priceRange !== "all" || sectionFilter !== "all";
  const showDropdown = open && (query.trim() || hasActiveFilters);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBookService = (item: FlatPricingItem) => {
    setSelectedService(item.name);
    setAuthGateOpen(true);
    setOpen(false);
    setQuery("");
    setShowFilters(false);
  };

  const clearAll = () => {
    setQuery("");
    setPriceRange("all");
    setSectionFilter("all");
  };

  return (
    <>
      <div ref={containerRef} className="relative">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-all hover:opacity-80"
            style={{ background: "rgba(180,120,56,0.1)", color: "#9a6830" }}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Search & book</span>
          </button>
        )}

        {open && (
          <div className="relative">
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all"
              style={{ background: "rgba(180,120,56,0.08)", border: "1px solid rgba(180,120,56,0.25)" }}
            >
              <Search className="h-3.5 w-3.5 shrink-0" style={{ color: "#9a6830" }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services…"
                className="w-40 lg:w-56 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <button
                onClick={() => { setShowFilters(!showFilters); if (!query.trim() && !hasActiveFilters) setQuery(" "); }}
                className={`shrink-0 transition-colors rounded-full p-0.5 ${showFilters || hasActiveFilters ? "text-white" : "text-gray-400 hover:text-gray-600"}`}
                style={showFilters || hasActiveFilters ? { background: "#b47838" } : {}}
                title="Filters"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { setOpen(false); clearAll(); setShowFilters(false); }}
                className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {showDropdown && (
              <div
                className="absolute right-0 top-full mt-2 w-96 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                style={{ background: "#fff", border: "1px solid rgba(180,120,56,0.15)" }}
              >
                {showFilters && (
                  <div className="px-4 py-3 space-y-3" style={{ background: "rgba(180,120,56,0.04)", borderBottom: "1px solid rgba(180,120,56,0.1)" }}>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#9a6830" }}>Category</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => setSectionFilter("all")}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${sectionFilter === "all" ? "text-white" : "text-gray-600 hover:text-gray-800"}`}
                          style={sectionFilter === "all" ? { background: "#b47838" } : { background: "rgba(180,120,56,0.08)" }}
                        >
                          All
                        </button>
                        {allSections.filter(s => {
                          // Only show sections that have priced items
                          return allPricedItems.some(item => item.sectionKey === s.key);
                        }).map((s) => (
                          <button
                            key={s.key}
                            onClick={() => setSectionFilter(s.key === sectionFilter ? "all" : s.key)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${sectionFilter === s.key ? "text-white" : "text-gray-600 hover:text-gray-800"}`}
                            style={sectionFilter === s.key ? { background: "#b47838" } : { background: "rgba(180,120,56,0.08)" }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#9a6830" }}>Price Range</p>
                      <div className="flex flex-wrap gap-1.5">
                        {priceRanges.map((r) => (
                          <button
                            key={r.value}
                            onClick={() => setPriceRange(r.value)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${priceRange === r.value ? "text-white" : "text-gray-600 hover:text-gray-800"}`}
                            style={priceRange === r.value ? { background: "#b47838" } : { background: "rgba(180,120,56,0.08)" }}
                          >
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {hasActiveFilters && (
                      <button onClick={clearAll} className="text-[11px] underline" style={{ color: "#b47838" }}>
                        Clear filters
                      </button>
                    )}
                  </div>
                )}

                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    No services found
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {Array.from(grouped.entries()).map(([section, items]) => (
                      <div key={section}>
                        <div
                          className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
                          style={{ background: "rgba(180,120,56,0.06)", color: "#9a6830" }}
                        >
                          {section}
                        </div>
                        {items.map((item, i) => (
                          <button
                            key={i}
                            onClick={() => handleBookService(item)}
                            className="group flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50"
                          >
                            <div className="text-left">
                              <span className="text-gray-700">{item.name}</span>
                              <span className="ml-2 text-[11px] text-gray-400">{item.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold" style={{ color: "#b47838" }}>{item.price}</span>
                              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white" style={{ background: "#b47838" }}>
                                Book
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between border-t px-4 py-2.5" style={{ borderColor: "rgba(180,120,56,0.12)" }}>
                  <span className="text-[11px] text-gray-400">{results.length} result{results.length !== 1 ? "s" : ""}</span>
                  <Link
                    to="/pricing"
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color: "#b47838" }}
                    onClick={() => { setOpen(false); clearAll(); setShowFilters(false); }}
                  >
                    View full price list <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AuthGateModal
        open={authGateOpen}
        onOpenChange={setAuthGateOpen}
        serviceName={selectedService}
      />
    </>
  );
};
