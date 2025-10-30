import { useMemo, useState } from "react";
import { Button } from "/src/client/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/src/client/components/ui/card";
import { Input } from "/src/client/components/ui/input";
import { Label } from "/src/client/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "/src/client/components/ui/select";
import { Switch } from "/src/client/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "/src/client/components/ui/tabs";
import { Textarea } from "/src/client/components/ui/textarea";
import { Checkbox } from "/src/client/components/ui/checkbox";
import { Separator } from "/src/client/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "/src/client/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "/src/client/components/ui/tooltip";
import { toast } from "sonner";
import { Copy, ExternalLink, Eye, Link2 } from "lucide-react";

function b64(input: string) {
  try {
    return btoa(input);
  } catch {
    // Fallback for unicode strings
    return btoa(unescape(encodeURIComponent(input)));
  }
}

type LogLevel = "debug" | "info" | "warning" | "error" | "silent";

export function ConfigForm() {
  const [subUrl, setSubUrl] = useState("");
  const [convert, setConvert] = useState(true);
  const [nameserver, setNameserver] = useState<"strict" | "direct">("strict");
  const [rules, setRules] = useState<"remote" | "always-resolve">("remote");
  const [quic, setQuic] = useState(true);
  const [level, setLevel] = useState<LogLevel>("warning");

  // Advanced
  const [regions, setRegions] = useState("HK,JP,US");
  const [rate, setRate] = useState<string>("");
  const [filter, setFilter] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");

  const link = useMemo(() => {
    if (!subUrl) return "";
    const qs = new URLSearchParams();
    qs.set("sub", b64(subUrl.trim()));
    qs.set("convert", String(convert));
    qs.set("nameserver", nameserver);
    qs.set("rules", rules);
    qs.set("quic", String(quic));
    qs.set("level", level);
    if (regions.trim()) qs.set("regions", regions.trim());
    if (rate.trim()) qs.set("rate", String(parseInt(rate.trim(), 10)));
    if (filter.trim()) qs.set("filter", filter.trim());
    return `${location.origin}/sub?${qs.toString()}`;
  }, [subUrl, convert, nameserver, rules, quic, level, regions, rate, filter]);

  async function onCopyLink() {
    if (!link) {
      toast.error("请先填写订阅地址");
      return;
    }
    await navigator.clipboard.writeText(link);
    toast.success("链接已复制，可在 Clash 中使用");
  }

  function onOpenLink() {
    if (!link) {
      toast.error("请先填写订阅地址");
      return;
    }
    window.open(link, "_blank");
  }

  async function onPreview() {
    if (!link) {
      toast.error("请先填写订阅地址");
      return;
    }
    try {
      const res = await fetch(link);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const txt = await res.text();
      setPreviewContent(txt);
      setPreviewOpen(true);
    } catch (e: any) {
      toast.error(e?.message ?? "预览失败");
    }
  }

  return (
    <TooltipProvider>
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>订阅配置</CardTitle>
          <CardDescription>生成支持 Clash 系客户端的订阅转换链接（无需 Token）</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="sub">订阅地址</Label>
            <Input
              id="sub"
              placeholder="https://example.com/subscription"
              value={subUrl}
              onChange={(e) => setSubUrl(e.target.value)}
            />
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">基础</TabsTrigger>
              <TabsTrigger value="advanced">高级</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-5 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>是否优化转换</Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <div className="font-medium">配置优化</div>
                      <div className="text-muted-foreground text-sm">启用规则与 DNS 优化</div>
                    </div>
                    <Switch checked={convert} onCheckedChange={setConvert} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>DNS 策略</Label>
                  <Select value={nameserver} onValueChange={(v: any) => setNameserver(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择 DNS 策略" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">严格（国内直连，国外远程）</SelectItem>
                      <SelectItem value="direct">直连（全部走直连 DoH）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>未命中解析</Label>
                  <Select value={rules} onValueChange={(v: any) => setRules(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择解析策略" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">按规则远程解析</SelectItem>
                      <SelectItem value="always-resolve">总是解析</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>HTTP/3 QUIC</Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="space-y-0.5">
                      <div className="font-medium">禁用 QUIC</div>
                      <div className="text-muted-foreground text-sm">推荐开启以降低网络异常</div>
                    </div>
                    <Switch checked={quic} onCheckedChange={setQuic} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>日志级别</Label>
                  <Select value={level} onValueChange={(v: any) => setLevel(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择日志级别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">debug</SelectItem>
                      <SelectItem value="info">info</SelectItem>
                      <SelectItem value="warning">warning</SelectItem>
                      <SelectItem value="error">error</SelectItem>
                      <SelectItem value="silent">silent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-5 pt-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="regions">地区优先（逗号分隔）</Label>
                  <Input
                    id="regions"
                    placeholder="例如：HK,JP,US"
                    value={regions}
                    onChange={(e) => setRegions(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">最大计费倍率</Label>
                  <Input
                    id="rate"
                    type="number"
                    min={1}
                    placeholder="例如：2"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="filter">排除节点（正则，可选）</Label>
                  <Input id="filter" placeholder="例如：(?i)\b(test|trial)\b" value={filter} onChange={(e) => setFilter(e.target.value)} />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" onClick={onCopyLink}>
                    <Copy className="mr-2 size-4" />复制链接
                  </Button>
                </TooltipTrigger>
                <TooltipContent>复制到剪贴板，在 Clash 中粘贴</TooltipContent>
              </Tooltip>
              <Button variant="outline" onClick={onOpenLink}>
                <ExternalLink className="mr-2 size-4" />打开链接
              </Button>
              <Button onClick={onPreview}>
                <Eye className="mr-2 size-4" />预览配置
              </Button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link2 className="size-3.5" />
                <span className="truncate">{link || "将根据上方设置自动生成链接"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>配置预览（文本）</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70dvh] overflow-auto rounded-md border bg-muted/30 p-3 text-sm">
            <pre className="whitespace-pre-wrap leading-relaxed">{previewContent}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

