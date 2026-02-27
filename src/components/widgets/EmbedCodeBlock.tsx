"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface EmbedCodeBlockProps {
  widgetId: string;
}

export function EmbedCodeBlock({ widgetId }: EmbedCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const appUrl =
    typeof window !== "undefined" ? window.location.origin : "";

  const embedCode = `<!-- TestimonialBox Widget -->
<div id="testimonialbox-widget" data-widget-id="${widgetId}"></div>
<script src="${appUrl}/widget.js" async></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success("Embed code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy embed code");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
          Embed Code
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5"
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy Code
            </>
          )}
        </Button>
      </div>
      <div className="relative overflow-hidden rounded-lg border bg-zinc-950 p-4">
        <pre className="overflow-x-auto text-sm leading-relaxed">
          <code className="text-zinc-100">
            <span className="text-zinc-500">
              {`<!-- TestimonialBox Widget -->`}
            </span>
            {"\n"}
            <span className="text-emerald-400">{`<div`}</span>
            <span className="text-sky-300">{` id`}</span>
            <span className="text-zinc-400">{`=`}</span>
            <span className="text-amber-300">{`"testimonialbox-widget"`}</span>
            <span className="text-sky-300">{` data-widget-id`}</span>
            <span className="text-zinc-400">{`=`}</span>
            <span className="text-amber-300">{`"${widgetId}"`}</span>
            <span className="text-emerald-400">{`>`}</span>
            <span className="text-emerald-400">{`</div>`}</span>
            {"\n"}
            <span className="text-emerald-400">{`<script`}</span>
            <span className="text-sky-300">{` src`}</span>
            <span className="text-zinc-400">{`=`}</span>
            <span className="text-amber-300">{`"${appUrl}/widget.js"`}</span>
            <span className="text-sky-300">{` async`}</span>
            <span className="text-emerald-400">{`>`}</span>
            <span className="text-emerald-400">{`</script>`}</span>
          </code>
        </pre>
      </div>
      <p className="text-muted-foreground text-xs">
        Paste this code into your website&apos;s HTML where you want the
        testimonials to appear.
      </p>
    </div>
  );
}
