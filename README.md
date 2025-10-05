# Clash Config Script

## 🎯 TODO

- [ ] 1. 迁移到 GEOSITE
- [ ] 2. 避免使用 classic behavior 规则
- [ ] 3. 检查 https://github.com/DustinWin/ShellCrash/blob/dev/public/fake_ip_filter.list 以补全 fake-ip-filter
- [ ] 5. 使用 token 和 kv 优化
- [ ] 6. subrequest 被 cloudflare 缓存

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

4. **启动开发服务器**
   ```bash
   bun run dev
   ```
   开发服务器将在本地启动，可以进行调试和测试。

## 🖥️ 使用方法

- 获取机场订阅地址，进行 base64 转码
- 添加机场订阅 URL: https://clash.jctaoo.site/sub?sub=your-base64-url
- 可以为订阅设置自动更新，1440分钟更新一次
- clash-verge-rev: 打开 虚拟网卡模式，关闭系统代理，虚拟网卡配置中，开启 严格路由
- clashx.meta: 根据如下图片配置，然后使用 tun 模式，关闭系统代理 ![clashx-meta](./clashx-meta.png)
  > https://github.com/MetaCubeX/ClashX.Meta/issues/103#issuecomment-2510050389
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

### 🧑‍💻 MacOS

```sh
RAW_URL="https://your-raw-url"
SUB_URL=$(echo -n $RAW_URL | base64)
CONFIG_URL="https://clash.jctaoo.site/sub?sub=$SUB_URL"
ENCODED_CONFIG_URL=$(python3 -c "import urllib.parse; print(urllib.parse.quote('''$CONFIG_URL'''))")
URL_SCHEME="clash://install-config?url=$ENCODED_CONFIG_URL"
open $URL_SCHEME
```

### 📱 iOS

获取并运行 [快捷指令](https://www.icloud.com/shortcuts/e3afa7a85e924aa3926e6ea6b686bc83) (mac 也可以用)

---

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

#### 3. 更新订阅（使用编辑器）

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

#### 4. 删除订阅

```bash
bun run cli delete sk-your-token
```

#### 5. 列出所有订阅

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

# 2. 查看订阅
bun run cli get sk-your-token

# 3. 更新订阅
bun run cli update sk-your-token

# 4. 列出所有订阅
bun run cli list

# 5. 删除订阅
bun run cli delete sk-your-token
```

### CLI 注意事项

1. **Token 持久化**: 生成的 User Token 会自动保存在订阅信息中，可以随时通过 `get` 命令重新获取，无需担心丢失
2. **KV 命名空间**: 默认使用 wrangler.jsonc 中配置的 KV binding (默认为 "KV")
3. **Wrangler 依赖**: 需要安装并配置 Wrangler CLI
4. **身份验证**: 确保已通过 `wrangler login` 登录到 Cloudflare 账户
