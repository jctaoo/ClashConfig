#!/usr/bin/env bun

import path from "path";
import fs from "fs";
import YAML from "yaml";

const code = fs.readFileSync("Script.js", "utf-8");

const clashRelativeFolder = ".config/clash.meta/";

// get user home directory
const homeDir = process.env.HOME || process.env.USERPROFILE;

const clashDir = path.join(homeDir, clashRelativeFolder);

if (!fs.existsSync(clashDir)) {
  console.error(`Clash directory not found: ${clashDir}`);
  process.exit(1);
}

// get PROFILE from argv
if (process.argv.length < 3) {
  console.error("Usage: update.js <profile>");
  process.exit(1);
}
const profileName = process.argv[2];

const profileFile = path.join(clashDir, `${profileName}.yaml`);

if (!fs.existsSync(profileFile)) {
  console.error(`Profile file not found: ${profileFile}`);
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

console.log("Update complete");
