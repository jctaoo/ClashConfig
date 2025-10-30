import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/client/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/client/components/ui/accordion";
import { Badge } from "@/client/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/client/components/ui/tooltip";

type NameserverPolicy = "strict" | "direct";
type ResolveRules = "remote" | "always-resolve";

const directDoH = ["https://223.5.5.5/dns-query", "https://doh.pub/dns-query"];
const foreignDoH = [
  "https://cloudflare-dns.com/dns-query",
  "https://77.88.8.8/dns-query",
  "https://8.8.4.4/dns-query#ecs=1.1.1.1/24&ecs-override=true",
  "https://208.67.222.222/dns-query#ecs=1.1.1.1/24&ecs-override=true",
  "https://9.9.9.9/dns-query",
];

export function DnsDocs(props: { nameserver: NameserverPolicy; rules: ResolveRules }) {
  const { nameserver, rules } = props;

  function proxyBadge(text = "由代理解析") {
    return (
      <Badge variant="outline" className="font-mono">
        🛰️ {text}
      </Badge>
    );
  }

  function LabelTip({ text, emoji, content }: { text: string; emoji: string; content: string }) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help align-middle">{text}</span>
        </TooltipTrigger>
        <TooltipContent>
          <span className="mr-1">{emoji}</span>
          {content}
        </TooltipContent>
      </Tooltip>
    );
  }

  function withOutbound(kind: "DIRECT" | "PROXY", node: React.ReactNode) {
    return (
      <div className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="text-xs text-muted-foreground">{kind} ➜</span>
        {node}
      </div>
    );
  }

  function DnsListTooltip({ label, list }: { label: string; list: string[] }) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="font-mono">{label}</Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {list.map((d) => (
              <div key={d} className="font-mono text-xs">
                {d}
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  function dnsBadgeFor(list: string[]) {
    const isForeign = list === foreignDoH || list.join() === foreignDoH.join();
    return <DnsListTooltip label={isForeign ? "国际 DNS" : "国内 DNS"} list={list} />;
  }

  // Removed local DNS badge per latest requirement; show 国内/国际 DNS based on policy instead.

  const isDNS1 = nameserver === "strict"; // DNS1: 默认国外 DNS + nameserver-policy 分流
  const isRules1 = rules === "remote"; // Rules1: IP 规则 no-resolve，防 DNS 泄露
  const combo = `${isRules1 ? "R1" : "R2"}+${isDNS1 ? "D1" : "D2"}` as "R1+D1" | "R1+D2" | "R2+D1" | "R2+D2";

  function dnsForCnHit() {
    return withOutbound("DIRECT", dnsBadgeFor(directDoH));
  }
  function noteForCnHit() {
    return "✅ 直连访问";
  }
  function dnsForGlobalHit() {
    return withOutbound("PROXY", proxyBadge("由代理解析"));
  }
  function noteForGlobalHit() {
    return "✅ 代理访问";
  }

  function dnsForCnUnknown() {
    if (isRules1) {
      // Rules1（按规则远程解析）：小众网站统一走代理解析，直接在“使用的 DNS”列体现完整路径
      return (
        <div className="inline-flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs text-muted-foreground">漏网之鱼 ➜ PROXY ➜</span>
          {proxyBadge("由代理解析")}
        </div>
      );
    }
    // Rules2（总是解析）：按 DNS 策略显示 国内/国际 DNS，且不标注出站
    return dnsBadgeFor(isDNS1 ? foreignDoH : directDoH);
  }
  function noteForCnUnknown() {
    switch (combo) {
      case "R1+D1":
      case "R1+D2":
        return "⚠️ 由代理访问可能速度不如直连";
      case "R2+D1":
        return "⚠️ 国际 DNS 可能无法命中最优, ECS 有所缓解";
      case "R2+D2":
        return "✅ 国内 DNS 解析 ➜ 直连访问";
    }
  }

  function dnsForGlobalUnknown() {
    if (isRules1) {
      // Rules1：小众网站统一走代理解析，直接在“使用的 DNS”列体现完整路径
      return (
        <div className="inline-flex items-center gap-2 whitespace-nowrap">
          <span className="text-xs text-muted-foreground">漏网之鱼 ➜ PROXY ➜</span>
          {proxyBadge("由代理解析")}
        </div>
      );
    }
    // Rules2（总是解析）：按 DNS 策略显示 国内/国际 DNS，且不标注出站
    return dnsBadgeFor(isDNS1 ? foreignDoH : directDoH);
  }
  function noteForGlobalUnknown() {
    switch (combo) {
      case "R1+D1":
      case "R1+D2":
        return "✅ 代理访问";
      case "R2+D1":
        return "✅ 国际 DNS 解析 ➜ 代理访问";
      case "R2+D2":
        return "❌ 国内 DNS 解析可能导致 DNS 泄露";
    }
  }

  const rows = [
    {
      key: "cn-hit",
      label: <LabelTip text="国内网站" emoji="✅" content="规则命中" />,
      dns: dnsForCnHit(),
      note: noteForCnHit(),
    },
    {
      key: "global-hit",
      label: <LabelTip text="国外网站" emoji="✅" content="规则命中" />,
      dns: dnsForGlobalHit(),
      note: noteForGlobalHit(),
    },
    {
      key: "cn-unknown",
      label: <LabelTip text="国内小众网站" emoji="🧩" content="规则集不包含" />,
      dns: dnsForCnUnknown(),
      note: noteForCnUnknown(),
    },
    {
      key: "global-unknown",
      label: <LabelTip text="国外小众网站" emoji="🧩" content="规则集不包含" />,
      dns: dnsForGlobalUnknown(),
      note: noteForGlobalUnknown(),
    },
  ];

  return (
    <div className="bg-muted/30 border p-0 rounded-lg">
      <Accordion type="single" collapsible defaultValue="dns-docs" className="w-full">
        <AccordionItem value="dns-docs" className="border-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline rounded-none">
            <div>
              <div className="text-sm font-medium">DNS 配置说明</div>
              <div className="text-muted-foreground text-xs">了解策略差异，并查看当前选项将使用的 DNS, 根据需求选择最适合您的策略搭配!</div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <section className="space-y-3">
              <div className="text-sm font-medium">当前选择下，不同网站使用的 DNS</div>
              <Table className="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/5">场景</TableHead>
                    <TableHead className="w-2/5">使用的 DNS</TableHead>
                    <TableHead className="w-2/5">效果</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.key}>
                      <TableCell>{r.label}</TableCell>
                      <TableCell>{r.dns}</TableCell>
                      <TableCell>{r.note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isDNS1 && (
                <div className="rounded-md border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 p-3">
                  <p className="text-xs text-orange-900 dark:text-orange-200">
                    <span className="font-semibold">⚠️ Stash 用户注意：</span>
                    目前 Stash 不支持
                    <code className="px-1 py-0.5 rounded bg-orange-100 dark:bg-orange-900/50">国际 DNS</code> ，如果指定
                    <code className="px-1 py-0.5 rounded bg-orange-100 dark:bg-orange-900/50">国际 DNS</code>
                    ，会自动切换为
                    <code className="px-1 py-0.5 rounded bg-orange-100 dark:bg-orange-900/50">国内 DNS</code>。
                  </p>
                </div>
              )}
              {!isDNS1 && (
                <div className="rounded-md border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 p-3">
                  <p className="text-xs text-orange-900 dark:text-orange-200">
                    使用
                    <code className="px-1 py-0.5 rounded bg-orange-100 dark:bg-orange-900/50">国内DNS</code>
                    策略的同时最好打开禁用 QUIC 协议，因为 QUIC (UDP) 协议下 Clash 总是会进行本地 DNS 解析，可能导致 DNS 泄露
                  </p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                参考：
                <a
                  href="https://wiki.metacubex.one/config/dns/diagram/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="underline underline-offset-4"
                >
                  Mihomo 的 DNS 解析流程
                </a>
              </p>
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
