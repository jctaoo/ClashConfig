import { FC } from 'hono/jsx';

export const ConfigPage: FC = () => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Clash Config - 订阅配置生成器</title>
        <style>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
            color: #333;
          }

          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
          }

          h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            color: #667eea;
            text-align: center;
          }

          .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1rem;
          }

          .form-group {
            margin-bottom: 20px;
          }

          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #444;
          }

          .label-desc {
            font-size: 0.85rem;
            color: #666;
            font-weight: 400;
            margin-left: 4px;
          }

          input[type="text"],
          input[type="number"],
          select {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
          }

          input[type="text"]:focus,
          input[type="number"]:focus,
          select:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .checkbox-group {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
          }

          .checkbox-label {
            margin: 0;
            cursor: pointer;
            user-select: none;
          }

          .btn {
            width: 100%;
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin-bottom: 10px;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
          }

          .btn-secondary {
            background: #f5f5f5;
            color: #333;
          }

          .btn-secondary:hover {
            background: #e0e0e0;
          }

          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .output-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            display: none;
          }

          .output-section.show {
            display: block;
          }

          .output-label {
            font-weight: 600;
            margin-bottom: 10px;
            color: #444;
          }

          .output-url {
            background: white;
            padding: 16px;
            border-radius: 8px;
            border: 2px solid #e0e0e0;
            word-break: break-all;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            margin-bottom: 10px;
          }

          .advanced-section {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
          }

          .advanced-toggle {
            background: none;
            border: none;
            color: #667eea;
            font-weight: 600;
            cursor: pointer;
            padding: 10px 0;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .advanced-toggle:hover {
            color: #764ba2;
          }

          .advanced-toggle::before {
            content: '▶';
            transition: transform 0.3s ease;
          }

          .advanced-toggle.active::before {
            transform: rotate(90deg);
          }

          .advanced-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
          }

          .advanced-content.show {
            max-height: 1000px;
          }

          .alert {
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 0.95rem;
          }

          .alert-info {
            background: #e3f2fd;
            color: #1976d2;
            border: 1px solid #90caf9;
          }

          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            color: #666;
            font-size: 0.9rem;
          }

          .footer a {
            color: #667eea;
            text-decoration: none;
          }

          .footer a:hover {
            text-decoration: underline;
          }

          @media (max-width: 600px) {
            .container {
              padding: 20px;
            }

            h1 {
              font-size: 1.8rem;
            }

            .subtitle {
              font-size: 1rem;
            }
          }
        `}</style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 Clash Config</h1>
          <p class="subtitle">订阅配置生成器</p>

          <div class="alert alert-info">
            📝 填写订阅链接和配置参数，生成优化的 Clash 订阅 URL
          </div>

          <form id="configForm">
            <div class="form-group">
              <label for="subUrl">
                订阅链接 <span class="label-desc">(必填)</span>
              </label>
              <input type="text" id="subUrl" placeholder="https://your-subscription-url.com" required />
            </div>

            <div class="form-group">
              <div class="checkbox-group">
                <input type="checkbox" id="convert" checked />
                <label for="convert" class="checkbox-label">启用配置优化</label>
              </div>
            </div>

            <div class="advanced-section">
              <button type="button" class="advanced-toggle" id="advancedToggle">
                高级选项
              </button>
              <div class="advanced-content" id="advancedContent">
                <div class="form-group">
                  <label for="regions">
                    地区过滤 <span class="label-desc">(可选，用逗号分隔，如：HK,US,JP)</span>
                  </label>
                  <input type="text" id="regions" placeholder="HK,US,JP" />
                </div>

                <div class="form-group">
                  <label for="rate">
                    最大计费倍率 <span class="label-desc">(可选，只保留小于等于该值的节点)</span>
                  </label>
                  <input type="number" id="rate" min="0" step="0.1" placeholder="1.0" />
                </div>

                <div class="form-group">
                  <label for="filter">
                    节点名称过滤正则 <span class="label-desc">(可选，移除不符合的节点)</span>
                  </label>
                  <input type="text" id="filter" placeholder=".*" />
                </div>

                <div class="form-group">
                  <label for="nameserver">DNS Nameserver 策略</label>
                  <select id="nameserver">
                    <option value="strict">strict (严格模式，推荐)</option>
                    <option value="direct">direct (直连模式)</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="rules">DNS 解析策略</label>
                  <select id="rules">
                    <option value="remote">remote (代理解析，推荐)</option>
                    <option value="always-resolve">always-resolve (总是解析)</option>
                  </select>
                </div>

                <div class="form-group">
                  <div class="checkbox-group">
                    <input type="checkbox" id="quic" checked />
                    <label for="quic" class="checkbox-label">禁用 QUIC 协议</label>
                  </div>
                </div>

                <div class="form-group">
                  <label for="level">日志等级</label>
                  <select id="level">
                    <option value="warning">warning (警告)</option>
                    <option value="debug">debug (调试)</option>
                    <option value="info">info (信息)</option>
                    <option value="error">error (错误)</option>
                    <option value="silent">silent (静默)</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="form-group" style="margin-top: 30px;">
              <button type="submit" class="btn btn-primary">生成订阅链接</button>
            </div>
          </form>

          <div class="output-section" id="outputSection">
            <div class="output-label">✅ 订阅链接已生成：</div>
            <div class="output-url" id="outputUrl"></div>
            <button type="button" class="btn btn-secondary" id="copyBtn">📋 复制链接</button>
          </div>

          <div class="footer">
            <p>
              <a href="https://github.com/jctaoo/ClashConfig" target="_blank">GitHub</a> · 
              <a href="https://clash.jctaoo.site/sub" target="_blank">API 文档</a>
            </p>
          </div>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // Get DOM elements
            const form = document.getElementById('configForm');
            const advancedToggle = document.getElementById('advancedToggle');
            const advancedContent = document.getElementById('advancedContent');
            const outputSection = document.getElementById('outputSection');
            const outputUrl = document.getElementById('outputUrl');
            const copyBtn = document.getElementById('copyBtn');

            // Toggle advanced options
            advancedToggle.addEventListener('click', () => {
              advancedToggle.classList.toggle('active');
              advancedContent.classList.toggle('show');
            });

            // Form submission
            form.addEventListener('submit', (e) => {
              e.preventDefault();
              generateUrl();
            });

            // Copy to clipboard
            copyBtn.addEventListener('click', () => {
              const url = outputUrl.textContent;
              navigator.clipboard.writeText(url).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = '✓ 已复制';
                setTimeout(() => {
                  copyBtn.textContent = originalText;
                }, 2000);
              }).catch(err => {
                alert('复制失败，请手动复制');
              });
            });

            function generateUrl() {
              const subUrl = document.getElementById('subUrl').value.trim();
              
              if (!subUrl) {
                alert('请输入订阅链接');
                return;
              }

              // Validate URL
              try {
                new URL(subUrl);
              } catch (e) {
                alert('请输入有效的订阅链接');
                return;
              }

              // Build query parameters
              const params = new URLSearchParams();
              
              // Required parameter: base64 encoded subscription URL
              params.append('sub', btoa(subUrl));

              // Convert option
              const convert = document.getElementById('convert').checked;
              params.append('convert', convert.toString());

              // Optional parameters
              const regions = document.getElementById('regions').value.trim();
              if (regions) {
                params.append('regions', regions);
              }

              const rate = document.getElementById('rate').value.trim();
              if (rate) {
                params.append('rate', rate);
              }

              const filter = document.getElementById('filter').value.trim();
              if (filter) {
                params.append('filter', filter);
              }

              const nameserver = document.getElementById('nameserver').value;
              if (nameserver !== 'strict') {
                params.append('nameserver', nameserver);
              }

              const rules = document.getElementById('rules').value;
              if (rules !== 'remote') {
                params.append('rules', rules);
              }

              const quic = document.getElementById('quic').checked;
              params.append('quic', quic.toString());

              const level = document.getElementById('level').value;
              if (level !== 'warning') {
                params.append('level', level);
              }

              // Get base URL (current origin or default)
              const baseUrl = window.location.origin || 'https://clash.jctaoo.site';
              const finalUrl = \`\${baseUrl}/sub?\${params.toString()}\`;

              // Display result
              outputUrl.textContent = finalUrl;
              outputSection.classList.add('show');

              // Scroll to output
              outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          `
        }} />
      </body>
    </html>
  );
};
