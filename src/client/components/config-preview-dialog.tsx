import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog";
import { Label } from "@/client/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/client/components/ui/select";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import Editor from "@monaco-editor/react";
import { toast } from "sonner";

interface ConfigPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}

// 常见的 Clash 客户端 User-Agent
const USER_AGENTS = [
  { label: "Clash Verge Rev", value: "clash-verge/v2.0.0", description: "Mihomo 内核" },
  { label: "Mihomo Party", value: "mihomo.party/v1.8.8 (clash.meta)", description: "Mihomo 内核" },
  {
    label: "ClashX Meta",
    value: "ClashX Meta/v1.4.24 (com.metacubex.ClashX.meta; build:622; macOS 26.0.0) Alamofire/5.10.2",
    description: "Mihomo 内核",
  },
  { label: "Clash Meta for Android", value: "ClashMetaForAndroid/2.11.16.Meta", description: "Mihomo 内核" },
  {
    label: "Clash Meta 裸内核",
    value: "Mihomo Meta v1.19.14 windows amd64 with go1.24.7 Wed Sep 24 09:12:02 UTC 2025",
    description: "Mihomo 裸核",
  },
  { label: "其他 Clash Meta 客户端", value: "clash", description: "Mihomo 内核" },
  { label: "Stash", value: "Stash/3.1.1 Clash/1.9.0", description: "Clash Premium 内核" },
];

export function ConfigPreviewDialog({ open, onOpenChange, url }: ConfigPreviewDialogProps) {
  const [userAgent, setUserAgent] = useState(USER_AGENTS[0].value);
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // 当 dialog 打开或 url/userAgent 改变时，获取预览内容
  useEffect(() => {
    if (!open || !url) {
      return;
    }

    const fetchPreview = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(url, {
          headers: {
            "X-Preview-UA": userAgent,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const text = await res.text();
        setContent(text);
      } catch (e: any) {
        const errorMsg = e?.message ?? "预览失败";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [open, url, userAgent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>配置预览</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* UA 选择器 */}
          <div className="space-y-2 flex flex-row justify-between items-center">
            <span className="space-y-1">
              <Label htmlFor="user-agent">客户端类型（User-Agent）</Label>
              <p className="text-xs text-muted-foreground">
                不同客户端会生成不同的配置内容，例如 Stash 会展开 GEOSITE 规则
              </p>
            </span>
            <div className="flex flex-row-reverse items-center gap-3">
              <Select value={userAgent} onValueChange={setUserAgent}>
                <SelectTrigger id="user-agent" className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_AGENTS.map((ua) => (
                    <SelectItem key={ua.value} value={ua.value} className="py-2">
                      <div className="flex flex-col items-start">
                        <span>{ua.label}</span>
                        <span className="text-xs text-muted-foreground">{ua.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loading && <Loader2 className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />}
            </div>
          </div>

          {/* 错误状态 */}
          {error && !loading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 编辑器 */}
          <div className="h-[60dvh] overflow-hidden rounded-md border">
            <Editor
              height="100%"
              defaultLanguage="yaml"
              value={content}
              theme="vs-dark"
              loading={
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              }
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineNumbers: "on",
                renderLineHighlight: "none",
                overviewRulerBorder: false,
                wordWrap: "on",
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
