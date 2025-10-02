#!/usr/bin/env bun

import path from "path";
import fs from "fs";
import YAML from "yaml";

const code = fs.readFileSync("clash-config-script.js", "utf-8");

// windows 使用 clash-verge-rev
if (process.platform === "win32") {
  const appdataDir = process.env.APPDATA;

  const clashVergeDir = path.join(
    appdataDir,
    "io.github.clash-verge-rev.clash-verge-rev"
  );

  if (!fs.existsSync(clashVergeDir)) {
    console.error(`❌ 未找到 Clash 目录: ${clashVergeDir}`);
    console.error(`请先安装 Clash Verge Rev`);
    process.exit(1);
  }

  const scriptFile = path.join(clashVergeDir, "profiles", "Script.js");

  // 创建备份并替换脚本，提醒已经更新脚本，需要刷新订阅
  const backupFile = path.join(clashVergeDir, "Script.js.bak");
  fs.copyFileSync(scriptFile, backupFile);
  fs.writeFileSync(scriptFile, code);
  console.log(`✅ 脚本已成功更新 ${scriptFile}`);
  console.log("🔄 请刷新订阅");
  process.exit(0);
}

// mac 使用 clashx.meta
if (process.platform === "darwin") {
  const clashRelativeFolder = ".config/clash.meta/";
  const homeDir = process.env.HOME || process.env.USERPROFILE;

  const clashDir = path.join(homeDir, clashRelativeFolder);

  if (!fs.existsSync(clashDir)) {
    console.error(`❌ 未找到 Clash 目录: ${clashDir}`);
    console.error(`请先安装 ClashX.meta`);
    process.exit(1);
  }

  // get PROFILE from argv
  if (process.argv.length < 3) {
    console.error("📖 用法: update.js <配置文件名>");
    process.exit(1);
  }
  const profileName = process.argv[2];

  const profileFile = path.join(clashDir, `${profileName}.yaml`);

  if (!fs.existsSync(profileFile)) {
    console.error(`❌ 未找到配置文件: ${profileFile}`);
    process.exit(1);
  }

  const profileContent = fs.readFileSync(profileFile, "utf-8");
  const profile = YAML.parse(profileContent);

  // prettier-ignore
  const run = new Function("CONFIG", "PROFILE", `
  "use strict";
  let __result;
  (function(){
    ${code}
    if (typeof main !== "function") {
      throw new Error("main(config, profileName) not found in Script.js");
    }
    __result = main(CONFIG, PROFILE);
  })();
  return __result;
`);
  const result = run(profile, profileName);

  // backup profile file
  const backupFile = path.join(clashDir, `${profileName}.yaml.bak`);
  fs.copyFileSync(profileFile, backupFile);

  // result to yaml
  const resultContent = YAML.stringify(result);
  fs.writeFileSync(profileFile, resultContent);

  console.log("✅ 更新完成");
  process.exit(0);
}
