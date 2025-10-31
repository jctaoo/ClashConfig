import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/client/components/ui/dialog";
import { Alert, AlertDescription } from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";
import { Info, Copy, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}

export function QRCodeDialog({ open, onOpenChange, url }: QRCodeDialogProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("订阅链接已复制到剪贴板");
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };

  const handleDownload = () => {
    try {
      const svg = document.querySelector("#qrcode-svg");
      if (!svg) {
        toast.error("无法获取二维码");
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "clash-subscription-qrcode.png";
            link.click();
            URL.revokeObjectURL(url);
            toast.success("二维码已下载");
          }
        });
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch {
      toast.error("下载失败");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>订阅链接二维码</DialogTitle>
          <DialogDescription>
            扫描二维码即可快速添加订阅
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center items-center p-6 bg-white rounded-lg">
            {url ? (
              <QRCodeSVG
                id="qrcode-svg"
                value={url}
                size={256}
                level="L"
                marginSize={0}
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-muted-foreground">
                请先生成订阅链接
              </div>
            )}
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              使用支持扫码的 Clash 客户端扫描此二维码，即可快速导入订阅配置
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={handleCopy}
              disabled={!url}
            >
              <Copy className="mr-2 h-4 w-4" />
              复制链接
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleDownload}
              disabled={!url}
            >
              <Download className="mr-2 h-4 w-4" />
              下载二维码
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
