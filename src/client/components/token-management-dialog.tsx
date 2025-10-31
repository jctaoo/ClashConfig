import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/client/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Info, ExternalLink, Key } from "lucide-react";

interface TokenManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TokenManagementDialog({ open, onOpenChange }: TokenManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Token 管理
          </DialogTitle>
          <DialogDescription>
            管理你的订阅链接 Token，保护隐私和控制访问权限
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 提示信息 */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>需要自己部署实例</AlertTitle>
            <AlertDescription>
              为了更好的安全性, 请部署你自己的 ClashConfig 实例以使用此功能。部署后，你可以生成多个订阅 Token 并单独设置配置，以 https://domain/sk-your-token 的形式访问，更好地保护你的订阅链接。
            </AlertDescription>
          </Alert>

          {/* 功能说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Token 功能说明</CardTitle>
              <CardDescription>Token 管理可以帮助你：</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>为每个订阅链接生成唯一 Token，防止链接泄露，并单独配置</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>随时撤销和重新生成 Token，控制访问权限</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>分享给朋友！</span>
              </div>
            </CardContent>
          </Card>

          {/* 部署说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">如何部署</CardTitle>
              <CardDescription>一键部署到 Cloudflare Workers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>ClashConfig 可以轻松部署到 Cloudflare Workers（免费）：</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>点击下方按钮，跳转到 Cloudflare 部署页面</li>
                  <li>登录或注册 Cloudflare 账号</li>
                  <li>按照提示完成部署（约 2 分钟）</li>
                  <li>使用自己的实例，即可使用 Token 管理功能 (包括基础订阅转换功能)</li>
                </ol>
              </div>

              {/* Cloudflare Deploy Button */}
              <a
                href="https://deploy.workers.cloudflare.com/?url=https://github.com/jctaoo/ClashConfig"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full" size="lg">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  部署到 Cloudflare Workers
                </Button>
              </a>

              <p className="text-xs text-center text-muted-foreground">
                免费版额度：每天 100,000 次请求，完全够用
              </p>
            </CardContent>
          </Card>

          {/* GitHub 链接 */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <a
              href="https://github.com/jctaoo/ClashConfig"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              查看 GitHub 仓库
            </a>
            <span>•</span>
            <a
              href="https://github.com/jctaoo/ClashConfig#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              阅读部署文档
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
