"use client";

import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { useApi } from "@/hooks/useApi";
import { LayerType } from "@/components/layout/AuthLayout/Sidebar/Sidebar";

interface SearchProps {
  activeLayer: LayerType;
  setActiveLayer: Dispatch<SetStateAction<LayerType>>;
}

interface SearchItem {
  title: string;
  description: string;
  redirect_url: string;
  message?: any;
}

interface SearchResponse {
  chats: SearchItem[];
  global_search: SearchItem[];
  messages: SearchItem[];
}

const SearchLayer: React.FC<SearchProps> = ({ activeLayer, setActiveLayer }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>({
    chats: [],
    global_search: [],
    messages: []
  });
  const debounced = useDebounce(query, 400);
  const { get } = useApi();

  useEffect(() => {
    if (!debounced.trim()) {
      setResults({ chats: [], global_search: [], messages: [] });
      return;
    }

    get<SearchResponse>("/search", { params: { q: debounced } })
      .then(data => setResults(data))
      .catch(() => setResults({ chats: [], global_search: [], messages: [] }));
  }, [debounced]);

  // helper to navigate
  const open = (url: string) => {
    if (url.startsWith("#")) {
      window.location.hash = url.slice(1);
    } else if (url.startsWith("@")) {
      window.location.hash = url;
    } else {
      window.location.hash = url;
    }
    setActiveLayer("main");
  };

  const allEmpty =
    results.chats.length === 0 &&
    results.global_search.length === 0 &&
    results.messages.length === 0;

  return (
    <div
      className={cn(
        "absolute inset-0 h-full border-r bg-background flex flex-col transition-transform duration-300 ease-in-out",
        activeLayer === "search" ? "translate-x-0 z-20" : "translate-x-full z-10"
      )}
    >
      {/* Header */}
      <div className="p-3 border-b flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => setActiveLayer("main")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search messages, chats, and people"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {!query.trim() ? (
          <div className="p-4 text-center text-muted-foreground">
            Enter a search term to find chats, users, or messages
          </div>
        ) : allEmpty ? (
          <div className="p-4 text-center text-muted-foreground">No results found</div>
        ) : (
          <>
            {/* Chats */}
            <Section title="Your Chats" items={results.chats} onSelect={open} />

            {/* Global */}
            <Section title="Global Search" items={results.global_search} onSelect={open} />

            {/* Messages */}
            <Section title="Messages" items={results.messages} onSelect={open} showSnippet />
          </>
        )}
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  items: SearchItem[];
  onSelect: (url: string) => void;
  showSnippet?: boolean; // for messages
}

function Section({ title, items, onSelect, showSnippet }: SectionProps) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="px-3 py-2 text-sm font-semibold">{title}</h3>
      {items.map((item, i) => (
        <div
          key={i}
          className="p-3 flex flex-col gap-1 cursor-pointer hover:bg-muted"
          onClick={() => onSelect(item.redirect_url)}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {item.title.charAt(0)}
            </div>
            <div className="font-medium">{item.title}</div>
          </div>
          <div className="text-sm text-muted-foreground">{item.description}</div>
          {showSnippet && item.message && (
            <div className="mt-1 px-3 py-2 bg-muted rounded">
              {item.message.body}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SearchLayer;
