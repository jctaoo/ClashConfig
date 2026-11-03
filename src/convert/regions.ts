// prettier-ignore
export const REGIONS = [
  { id: "hk", name: "香港", regexes: [/\bHK\b/i, /香港/i, /hong\s*kong/i], emoji: "🇭🇰" },
  { id: "mo", name: "澳门", regexes: [/\bMO\b/i, /澳門|澳门/i, /macao|macau/i], emoji: "🇲🇴" },
  { id: "jp", name: "日本", regexes: [/\bJP\b/i, /日本|japan/i, /tokyo|osaka|nagoya/i], emoji: "🇯🇵" },
  { id: "tw", name: "台湾", regexes: [/\bTW\b/i, /台灣|台湾|taiwan/i, /taipei|taichung|kaohsiung/i], emoji: "🇹🇼" },
  { id: "sg", name: "新加坡", regexes: [/\bSG\b/i, /新加坡|singapore/i], emoji: "🇸🇬" },
  { id: "us", name: "美国", regexes: [/\bUS\b|\bUSA\b/i, /美国|united\s*states|america/i, /los\s*angeles|san\s*francisco|new\s*york|seattle|chicago|dallas|miami/i], emoji: "🇺🇸" },
  { id: "gb", name: "英国", regexes: [/\bUK\b/i, /英国|united\s*kingdom|london/i], emoji: "🇬🇧" },
  { id: "de", name: "德国", regexes: [/\bDE\b/i, /德国|germany|frankfurt|munich|berlin/i], emoji: "🇩🇪" },
  { id: "fr", name: "法国", regexes: [/\bFR\b/i, /法国|france|paris/i], emoji: "🇫🇷" },
  { id: "nl", name: "荷兰", regexes: [/\bNL\b/i, /荷兰|netherlands|amsterdam/i], emoji: "🇳🇱" },
  { id: "kr", name: "韩国", regexes: [/\bKR\b/i, /韩国|korea|seoul/i], emoji: "🇰🇷" },
  { id: "au", name: "澳大利亚", regexes: [/\bAU\b/i, /澳大利亚|australia|sydney|melbourne/i], emoji: "🇦🇺" },
  { id: "ca", name: "加拿大", regexes: [/\bCA\b/i, /加拿大|canada|toronto|vancouver|montreal/i], emoji: "🇨🇦" },

  // { id: "my", name: "马来西亚", regexes: [/\bMY\b/i, /马来西亚|malaysia/i], emoji: "🇲🇾" },
  // { id: "th", name: "泰国", regexes: [/\bTH\b/i, /泰国|thailand/i], emoji: "🇹🇭" },

  // 可继续加入更多国家...
];

export function regionGroupName(region: { emoji: string; name: string }): string {
  return `${region.emoji} ${region.name}节点`;
}
