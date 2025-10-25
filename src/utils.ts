import * as yaml from "js-yaml";

export function formatDateTime(date: Date | number) {
	if (typeof date === "number") {
		return formatDateTime(new Date(date))
	}
	return date.toISOString();
}

/**
 * Parse YAML string to JSON object
 * @param yamlString - The YAML string to parse
 * @returns Parsed object
 */
export function parseYAML(yamlString: string): unknown {
	return yaml.load(yamlString);
}

/**
 * Dump object to YAML string
 * @param obj - The object to dump
 * @returns YAML string
 */
export function dumpYAML(obj: unknown): string {
	return yaml.dump(obj, { noRefs: true });
}

/**
 * Check if the text is likely to be YAML
 * @param text - The text to check
 * @returns True if the text is likely to be YAML, false otherwise
 */
export function isLikelyYAML(text: string): boolean {
  let i = 0;
  const len = text.length;

  // 去 BOM
  if (text.charCodeAt(0) === 0xFEFF) i++;

  // 最多扫描前几 KB 就行
  const limit = Math.min(len, 4096);
  let line = '';

  for (; i < limit; i++) {
    const ch = text[i];
    if (ch === '\n' || ch === '\r') {
      line = line.trim();
      // 跳过空行和注释行
      if (line === '' || line.startsWith('#') || line === '---') {
        line = '';
        continue;
      }
      break;
    }
    line += ch;
  }

  // 简单规则：包含冒号或 YAML 常见结构
  return /[:\-{}]/.test(line);
}
