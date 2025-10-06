# Clash Config Script

一个基于 Cloudflare Workers 的订阅转换服务，用于将机场订阅转换为优化的 Clash 配置文件。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fjctaoo%2FClashConfig)

## ✨ 特性

- 🚀 **无服务器部署**: 基于 Cloudflare Workers，全球加速访问
- 🎯 **智能规则**: 内置优化的分流规则，支持 GEOIP、GEOSITE 数据
- 🔐 **Token 管理**: 支持 Token 订阅管理，可配置节点过滤，feel free to share token with your friends
- 🌍 **地区筛选**: 支持按地区过滤节点
- 📦 **多内核支持**: 第一方支持 **Clash.Meta** 和 **Stash** 内核

## 🎯 TODO

- [ ] 1. 迁移到 GEOSITE, 避免使用 classic behavior 规则
- [ ] 2. 检查 https://github.com/DustinWin/ShellCrash/blob/dev/public/fake_ip_filter.list 以补全 fake-ip-filter
- [ ] 3. subrequest 被 cloudflare 缓存
- [ ] 4. 优化 README 文档

## ⚡ 快速开始

### PowerShell

```ps1
$RawUrl = "https://your-raw-url";
$SubUrl = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($RawUrl));
$ConfigUrl = "https://clash.jctaoo.site/sub?sub=$SubUrl";
$EncodedConfigUrl = [System.Net.WebUtility]::UrlEncode($ConfigUrl)
$UrlScheme = "clash://install-config?url=$EncodedConfigUrl";
Start-Process $UrlScheme
```

### MacOS

```sh
RAW_URL="https://your-raw-url"
SUB_URL=$(echo -n $RAW_URL | base64)
CONFIG_URL="https://clash.jctaoo.site/sub?sub=$SUB_URL"
ENCODED_CONFIG_URL=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$CONFIG_URL'''))")
URL_SCHEME="clash://install-config?url=$ENCODED_CONFIG_URL"
open $URL_SCHEME
```

### iOS

获取并运行 [快捷指令](https://www.icloud.com/shortcuts/e3afa7a85e924aa3926e6ea6b686bc83) (mac 也可以用)

更进一步，可以使用 token 管理的后台订阅 api，支持筛选节点等功能，参考下方使用方法

## 🖥️ 使用方法

### 📡 API Endpoints

#### 1. `/sub` - 基础订阅转换

**功能**: 将机场订阅地址转换为优化后的 Clash 配置

**参数**:
- `sub` (必需): Base64 编码的订阅 URL
- `convert` (可选): 是否进行配置转换，默认为 `true`。设置为 `false` 可跳过转换直接返回原始配置

**使用示例**:
```
https://clash.jctaoo.site/sub?sub=<base64-encoded-url>
https://clash.jctaoo.site/sub?sub=<base64-encoded-url>&convert=false
```

#### 2. `/:token` - Token 订阅（推荐）

**功能**: 使用 Token 获取订阅，支持自动缓存和配置管理, 支持过滤订阅的节点

**参数**:
- `token` (必需): 通过 CLI 工具生成的用户 Token（格式: `sk-xxxxx`）

**使用示例**:
```
https://clash.jctaoo.site/sk-your-token
```

**使用流程**:
1. 使用 `bun run cli add` 添加订阅并获取 token
2. 将 token 添加到 Clash 订阅地址: `https://clash.jctaoo.site/sk-your-token`
3. 使用 CLI 工具管理和更新订阅配置

### 💡 客户端说明

- 可以为订阅设置自动更新，1440分钟更新一次
- clash-verge-rev: 打开 虚拟网卡模式，关闭系统代理，虚拟网卡配置中，开启 严格路由
- clashx.meta: 根据如下图片配置，然后使用 tun 模式，关闭系统代理 ![clashx-meta](./clashx-meta.png)
  > https://github.com/MetaCubeX/ClashX.Meta/issues/103#issuecomment-2510050389
- 其他 clash: 使用 tun 模式


## 💻 Development

### 前置要求

1. 安装 [Bun](https://bun.sh)

### 开发步骤

1. **安装依赖**
   ```bash
   bun install
   ```

2. **登录 Cloudflare**（重要！）
   ```bash
   bun wrangler login
   ```
   这将打开浏览器进行 Cloudflare 账户授权。登录后才能访问 KV 存储和部署服务。

3. **生成 Geo 相关脚本**
   ```bash
   bun run pb-gen && bun run pb-gen-dts
   ```

4. **生成 Cloudflare Workers 类型定义**
   ```bash
   bun run cf-typegen
   ```
   这将根据 `wrangler.jsonc` 配置生成 TypeScript 类型定义文件，包括 KV、环境变量等的类型。

5. **启动开发服务器**
   ```bash
   bun run dev
   ```
   开发服务器将在本地启动，可以进行调试和测试。


## 🔧 CLI 工具使用指南

这是一个用于管理 Cloudflare KV 中订阅的命令行工具。

### CLI 命令

#### 1. 添加订阅（交互式）

```bash
bun run cli add
```

该命令会通过交互式提示引导你输入所有必要信息，并自动生成 token。

**提示说明：**
- **Subscription label**: 订阅标签（必填）
- **Subscription URL**: 订阅 URL（必填，必须以 http:// 或 https:// 开头）
- **Filter label**: 过滤器标签（可选，默认使用订阅标签）
- **Filter regions**: 地区列表（可选，多个地区用逗号分隔，如：HK,US,JP）
- **Set maximum billing rate**: 是否设置最大计费倍率（y/N）
- **Maximum billing rate**: 最大计费倍率（仅在上一步选择 y 时显示）
- **Exclude regex pattern**: 排除正则表达式（可选，用于过滤节点）

#### 2. 获取订阅信息

```bash
bun run cli get sk-your-token
```

该命令会显示指定 token 的订阅详细信息。Token 会保存在订阅信息中，可以随时通过此命令重新获取。

#### 3. 获取订阅链接

```bash
# 使用默认 base-url (https://clash.jctaoo.site)
bun run cli link sk-your-token

# 获取链接并自动在 Clash 中打开
bun run cli link sk-your-token --go
# 或使用简写
bun run cli link sk-your-token -g

# 自定义 base-url
bun run cli link sk-your-token --base-url https://your-worker.workers.dev

# 自定义 base-url 并打开
bun run cli link sk-your-token -b https://your-worker.workers.dev -g
```

该命令会生成完整的订阅链接。使用 `--go`/`-g` 参数可以自动生成 Clash URL scheme 并打开 Clash 客户端导入配置。

**参数说明：**
- `--base-url` / `-b`: Worker 部署的 base URL（默认：`https://clash.jctaoo.site`）
- `--go` / `-g`: 生成 Clash URL scheme 并自动打开（支持 Windows/macOS/Linux）

#### 4. 更新订阅（使用编辑器）

```bash
bun run cli update sk-your-token
```

该命令会打开你的默认编辑器，显示当前订阅信息的 JSON 格式，你可以直接在编辑器中修改。保存后会自动更新订阅。

**注意事项：**
- 必填字段：`label`, `url`, `filter.label`
- `token` 字段是只读的，即使在编辑器中修改也会被忽略
- `regions` 为空数组时会被忽略
- `maxBillingRate` 和 `excludeRegex` 为空时会被移除
- `content` 字段会被保留，不会在编辑器中显示（避免编辑器卡顿）
- 保存时会自动验证 JSON 格式和必填字段，如果验证失败会提示错误并允许继续编辑

#### 5. 删除订阅

```bash
bun run cli delete sk-your-token
```

#### 6. 列出所有订阅

```bash
bun run cli list
```

该命令会列出所有已保存的订阅信息，包括 token、标签、URL 等关键信息。

### KV Key 格式

- **用户 Token 格式**: `sk-{32位随机十六进制字符串}`
- **KV Key 格式**: `kv:{SHA256(用户Token)}`
- **存储值**: JSON 格式的 `ClashSubInformation` 对象

### 示例：完整工作流

```bash
# 1. 添加订阅
bun run cli add

# 2. 查看订阅信息
bun run cli get sk-your-token

# 3. 获取订阅链接并在 Clash 中打开
bun run cli link sk-your-token --go

# 4. 更新订阅
bun run cli update sk-your-token

# 5. 列出所有订阅
bun run cli list

# 6. 删除订阅
bun run cli delete sk-your-token
```

### CLI 注意事项

1. **Token 持久化**: 生成的 User Token 会自动保存在订阅信息中，可以随时通过 `get` 命令重新获取，无需担心丢失
2. **KV 命名空间**: 默认使用 wrangler.jsonc 中配置的 KV binding (默认为 "KV")
3. **Wrangler 依赖**: 需要安装并配置 Wrangler CLI
4. **身份验证**: 确保已通过 `wrangler login` 登录到 Cloudflare 账户
