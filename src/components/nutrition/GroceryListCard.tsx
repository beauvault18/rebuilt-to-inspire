"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Printer, ClipboardCopy, Check } from "lucide-react";
import type { GroceryCategory } from "@/types/nutrition";

interface Props {
  categories: GroceryCategory[];
}

export default function GroceryListCard({ categories }: Props) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const toggle = (itemKey: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedCount = checked.size;

  // Count checked items per category
  const checkedPerCategory = (catIndex: number) => {
    const cat = categories[catIndex];
    if (!cat) return 0;
    return cat.items.filter((item) =>
      checked.has(`${cat.category}-${item.name}`),
    ).length;
  };

  const buildPlainText = useCallback(() => {
    return categories
      .map((cat) => {
        const header = cat.category.toUpperCase();
        const items = cat.items
          .map((item) => `  [ ] ${item.name} — ${item.quantity}`)
          .join("\n");
        return `${header}\n${items}`;
      })
      .join("\n\n");
  }, [categories]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = buildPlainText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [buildPlainText]);

  const handlePrint = useCallback(() => {
    const text = buildPlainText();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Grocery List — Rebuilt To Inspire</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #222; }
            h1 { font-size: 22px; margin-bottom: 24px; }
            pre { font-size: 14px; line-height: 1.8; white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Grocery List</h1>
          <pre>${text}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [buildPlainText]);

  const activeCategory = categories[activeTab];

  return (
    <Card className="border-border/50">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="size-5 text-orange-400" />
            Grocery List
          </h3>
          <span className="text-sm text-muted-foreground">
            {checkedCount}/{totalItems} items
          </span>
        </div>

        {/* Copy / Print buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5 text-xs"
          >
            {copied ? (
              <Check className="size-3.5 text-green-400" />
            ) : (
              <ClipboardCopy className="size-3.5" />
            )}
            {copied ? "Copied!" : "Copy List"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs"
          >
            <Printer className="size-3.5" />
            Print
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat, i) => {
            const catChecked = checkedPerCategory(i);
            const catTotal = cat.items.length;
            const allDone = catChecked === catTotal && catTotal > 0;
            return (
              <button
                key={cat.category}
                onClick={() => setActiveTab(i)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  i === activeTab
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/40"
                    : allDone
                      ? "bg-muted/50 text-muted-foreground/60 border border-border/30 line-through"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/60 border border-transparent"
                }`}
              >
                {cat.category}
                <span className="ml-1.5 opacity-60">
                  {catChecked}/{catTotal}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active category items */}
        {activeCategory && (
          <div className="space-y-1">
            {activeCategory.items.map((item) => {
              const key = `${activeCategory.category}-${item.name}`;
              const isChecked = checked.has(key);
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors hover:bg-muted/50 ${
                    isChecked ? "opacity-50" : ""
                  }`}
                  onClick={() => toggle(key)}
                >
                  <Checkbox checked={isChecked} onCheckedChange={() => toggle(key)} />
                  <span
                    className={`text-sm flex-1 ${
                      isChecked ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {item.quantity}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
