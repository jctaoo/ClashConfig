# Clash Config Script

## 🎯 TODO

- [ ] 1. 迁移到 GEOSITE
- [ ] 2. 避免使用 classic behavior 规则
- [ ] 3. 检查 https://github.com/DustinWin/ShellCrash/blob/dev/public/fake_ip_filter.list 以补全 fake-ip-filter

## 🖥️ 使用方法

- 获取机场订阅地址，进行 base64 转码
- 添加机场订阅 URL: https://clash.jctaoo.site/sub?sub=your-base64-url
- 可以为订阅设置自动更新，1440分钟更新一次
- clash-verge-rev: 打开 虚拟网卡模式，关闭系统代理，虚拟网卡配置中，开启 严格路由
- 其他 clash: 使用 tun 模式

## 📟 一键命令

### 🪟 PowerShell

```ps1
$RawUrl = "https://your-raw-url";
$SubUrl = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($RawUrl));
$ConfigUrl = "https://clash.jctaoo.site/sub?sub=$SubUrl";
$EncodedConfigUrl = [System.Net.WebUtility]::UrlEncode($ConfigUrl)
$UrlScheme = "clash://install-config?url=$EncodedConfigUrl";
Start-Process $UrlScheme
```
