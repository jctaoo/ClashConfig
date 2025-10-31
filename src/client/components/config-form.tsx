import { useMemo, useState } from "react";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Switch } from "@/client/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/client/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/client/components/ui/tooltip";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { toast } from "sonner";
import { Copy, Download, Eye, Info, QrCode } from "lucide-react";
import { DnsDocs } from "@/client/components/dns-docs";
import { ConfigPreviewDialog } from "@/client/components/config-preview-dialog";
import { QRCodeDialog } from "@/client/components/qrcode-dialog";

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
  const [regions, setRegions] = useState("");
  const [rate, setRate] = useState<string>("");
  const [filter, setFilter] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [qrcodeOpen, setQrcodeOpen] = useState(false);

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

  function onImportToClash() {
    if (!link) {
      toast.error("请先填写订阅地址");
      return;
    }
    const clashUrl = `clash://install-config?url=${encodeURIComponent(link)}`;
    window.location.href = clashUrl;
    toast.success("正在导入到 Clash 客户端");
  }

  async function onPreview() {
    if (!link) {
      toast.error("请先填写订阅地址");
      return;
    }
    setPreviewOpen(true);
  }

  function onShowQRCode() {
    if (!link) {
      toast.error("请先填写订阅地址");
      return;
    }
    setQrcodeOpen(true);
  }

  return (
    <TooltipProvider>
      <Card className="border-muted/60">
        <CardHeader>
          <CardTitle>基础配置</CardTitle>
          <CardDescription>Clash 常规配置</CardDescription>
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

          <div className="space-y-5">
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
                <Tabs value={level} onValueChange={(v) => v && setLevel(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="debug">debug</TabsTrigger>
                    <TabsTrigger value="info">info</TabsTrigger>
                    <TabsTrigger value="warning">warning</TabsTrigger>
                    <TabsTrigger value="error">error</TabsTrigger>
                    <TabsTrigger value="silent">silent</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regions">筛选地区节点（逗号分隔）</Label>
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

              <div className="space-y-2">
                <Label htmlFor="filter">排除节点（正则，可选）</Label>
                <Input id="filter" placeholder="例如：(?i)\b(test|trial)\b" value={filter} onChange={(e) => setFilter(e.target.value)} />
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <Card className="mt-6 border-muted/60">
        <CardHeader>
          <CardTitle>DNS 配置</CardTitle>
          <CardDescription>解析策略与行为说明</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>DNS 策略</Label>
              <Tabs value={nameserver} onValueChange={(v) => v && setNameserver(v as any)} className="w-fit">
                <TabsList>
                  <TabsTrigger value="strict">国际 DNS</TabsTrigger>
                  <TabsTrigger value="direct">国内 DNS</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>未命中解析</Label>
              <Tabs value={rules} onValueChange={(v) => v && setRules(v as any)} className="w-fit">
                <TabsList>
                  <TabsTrigger value="remote">按规则远程解析</TabsTrigger>
                  <TabsTrigger value="always-resolve">总是解析</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <DnsDocs nameserver={nameserver} rules={rules} />
        </CardContent>
      </Card>

      <Card className="mt-6 border-muted/60">
        <CardHeader>
          <CardTitle>链接与操作</CardTitle>
          <CardDescription>生成的订阅链接与常用操作</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              ClashConfig 将根据 User-Agent 来判断不同客户端，支持 Mihomo 内核以及 Clash Premium（Stash）内核，并支持在 Stash 下的 GEOSITE 规则等的展开。
            </AlertDescription>
          </Alert>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              使用裸核时，将 mihomo -v 的内容作为 User-Agent 请求订阅链接即可。
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Label htmlFor="gen-link">生成的链接</Label>
            <Input
              id="gen-link"
              readOnly
              className="font-mono text-xs"
              value={link || "将根据上方设置自动生成链接"}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" onClick={onCopyLink}>
                  <Copy className="mr-2 size-4" />复制链接
                </Button>
              </TooltipTrigger>
              <TooltipContent>复制到剪贴板，在 Clash 中粘贴</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onImportToClash}>
                  <Download className="mr-2 size-4" />导入 Clash
                </Button>
              </TooltipTrigger>
              <TooltipContent>直接导入到 Clash 客户端</TooltipContent>
            </Tooltip>
            <Button onClick={onPreview}>
              <Eye className="mr-2 size-4" />预览配置
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onShowQRCode}>
                  <QrCode className="mr-2 size-4" />二维码
                </Button>
              </TooltipTrigger>
              <TooltipContent>显示订阅链接二维码</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <ConfigPreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} url={link} />
      <QRCodeDialog open={qrcodeOpen} onOpenChange={setQrcodeOpen} url={link} />
    </TooltipProvider>
  );
}

