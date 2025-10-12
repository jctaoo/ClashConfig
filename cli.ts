#!/usr/bin/env bun
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { createHash, randomBytes } from "crypto";
import { exec } from "child_process";
import { promisify } from "util";
import { input, confirm, number, editor } from "@inquirer/prompts";
import type { ClashSubInformation } from "./src/sub";
import { z } from "zod";
import { DNSPolicySchema } from "./src/convert/dns";

const execAsync = promisify(exec);

// CLI 使用的订阅信息类型，不包含 content 字段
type ClashSubInformationCLI = Omit<ClashSubInformation, 'content'>;

// Zod schema for validating subscription information
const ClashSubInformationSchema = z.object({
  token: z.string().regex(/^sk-[a-f0-9]{32}$/, "Token must be in format sk-xxxx"),
  label: z.string().min(1, "Label is required"),
  url: z.string().url("Must be a valid URL").refine(
    (url) => url.startsWith("http://") || url.startsWith("https://"),
    "URL must start with http:// or https://"
  ),
  filter: z.object({
    label: z.string().min(1, "Filter label is required"),
    regions: z.array(z.string()).optional(),
    maxBillingRate: z.number().positive().optional(),
    excludeRegex: z.string().optional(),
  }),
  dnsPolicy: z.object({
    nameserver: DNSPolicySchema.shape.nameserver,
    rules: DNSPolicySchema.shape.rules,
  }).optional(),
  disableQuic: z.boolean().optional(),
  logLevel: z.enum(["debug", "info", "warning", "error", "silent"]).optional(),
});

const KV_BINDING = "KV";

/**
 * Generate a new user token in the format sk-xxxx
 */
function generateToken(): string {
  const randomPart = randomBytes(16).toString("hex");
  return `sk-${randomPart}`;
}

/**
 * Hash token with SHA256
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Get KV key from user token
 */
function getKVKey(userToken: string): string {
  const hashedToken = hashToken(userToken);
  return `kv:${hashedToken}`;
}

/**
 * Execute wrangler kv command
 */
async function kvPut(key: string, value: string, metadata?: Record<string, any>): Promise<void> {
  let command = `wrangler kv key put --binding=${KV_BINDING} --remote "${key}" "${value.replace(/"/g, '\\"')}"`;
  
  // Add metadata if provided
  if (metadata) {
    const metadataJson = JSON.stringify(metadata).replace(/"/g, '\\"');
    command += ` --metadata "${metadataJson}"`;
  }
  
  console.log(`Executing: ${command}`);
  const { stdout, stderr } = await execAsync(command);
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);
}

async function kvGet(key: string): Promise<string | null> {
  try {
    const command = `wrangler kv key get --binding=${KV_BINDING} --remote "${key}"`;
    const { stdout, stderr } = await execAsync(command);
    const output = stdout.trim();
    
    // Check if output indicates key not found
    if (
      output.toLowerCase().includes("not found") ||
      output.toLowerCase().includes("value not found") ||
      output === ""
    ) {
      return null;
    }
    
    return output;
  } catch (error: any) {
    // Check various error conditions that indicate key not found
    const errorMessage = (error.message || "").toLowerCase();
    const errorStderr = (error.stderr || "").toLowerCase();
    
    if (
      errorMessage.includes("not found") ||
      errorMessage.includes("value not found") ||
      errorStderr.includes("not found") ||
      errorStderr.includes("value not found") ||
      error.code === 1
    ) {
      return null;
    }
    throw error;
  }
}

async function kvDelete(key: string): Promise<void> {
  const command = `wrangler kv key delete --binding=${KV_BINDING} --remote "${key}"`;
  console.log(`Executing: ${command}`);
  const { stdout, stderr } = await execAsync(command);
  if (stderr) console.error(stderr);
  if (stdout) console.log(stdout);
}

async function kvList(prefix?: string): Promise<Array<{ name: string }>> {
  const prefixArg = prefix ? `--prefix="${prefix}"` : "";
  const command = `wrangler kv key list --binding=${KV_BINDING} --remote ${prefixArg}`;
  const { stdout } = await execAsync(command);
  return JSON.parse(stdout);
}

/**
 * Log subscription information in a formatted way
 */
function logSubInfo(subInfo: ClashSubInformationCLI, kvKey?: string): void {
  console.log("\n✅ Subscription Information:");
  
  console.log(`  🔑 Token:           ${subInfo.token}`);
  
  if (kvKey) {
    console.log(`  🗝️  KV Key:          ${kvKey}`);
  }
  
  console.log(`  🏷️  Label:           ${subInfo.label}`);
  console.log(`  🔗 URL:             ${subInfo.url}`);
  console.log(`  🎯 Filter Label:    ${subInfo.filter.label}`);
  
  if (subInfo.filter.regions && subInfo.filter.regions.length > 0) {
    console.log(`  🌍 Regions:         ${subInfo.filter.regions.join(", ")}`);
  }
  if (subInfo.filter.maxBillingRate) {
    console.log(`  💰 Max Billing:     ${subInfo.filter.maxBillingRate}`);
  }
  if (subInfo.filter.excludeRegex) {
    console.log(`  🚫 Exclude Regex:   ${subInfo.filter.excludeRegex}`);
  }
  
  // Display DNS policy
  if (subInfo.dnsPolicy) {
    console.log(`  🌐 DNS Nameserver:  ${subInfo.dnsPolicy.nameserver || "strict"}`);
    console.log(`  📡 DNS Rules:       ${subInfo.dnsPolicy.rules || "remote"}`);
  }
  
  // Display QUIC setting
  if (subInfo.disableQuic !== undefined) {
    console.log(`  🚀 Disable QUIC:    ${subInfo.disableQuic}`);
  }
  
  // Display log level
  if (subInfo.logLevel) {
    console.log(`  📝 Log Level:       ${subInfo.logLevel}`);
  }
}

// CLI Commands
yargs(hideBin(process.argv))
  .scriptName("clash-sub-cli")
  .usage("$0 <command> [options]")
  
  // Add a new subscription
  .command(
    "add",
    "Add a new subscription and generate a token",
    () => {},
    async () => {
      console.log("\n📝 Add New Subscription\n");
      
      // Collect subscription information interactively
      const label = await input({
        message: "Subscription label:",
        required: true,
      });
      
      const url = await input({
        message: "Subscription URL:",
        required: true,
        validate: (value) => {
          if (!value.startsWith("http://") && !value.startsWith("https://")) {
            return "URL must start with http:// or https://";
          }
          return true;
        },
      });
      
      const filterLabel = await input({
        message: "Filter label:",
        default: label,
      });
      
      const regionsInput = await input({
        message: "Filter regions (comma-separated, e.g., HK,US,JP):",
        default: "",
      });
      
      const regions = regionsInput
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);
      
      const hasMaxBillingRate = await confirm({
        message: "Set maximum billing rate?",
        default: false,
      });
      
      let maxBillingRate: number | undefined;
      if (hasMaxBillingRate) {
        maxBillingRate = await number({
          message: "Maximum billing rate:",
          required: true,
        });
      }
      
      const excludeRegex = await input({
        message: "Exclude regex pattern (optional):",
        default: "",
      });
      
      // DNS policy configuration
      const configureDns = await confirm({
        message: "Configure DNS policy?",
        default: false,
      });
      
      let dnsPolicy: z.infer<typeof DNSPolicySchema> | undefined;
      if (configureDns) {
        const nameserverInput = await input({
          message: "DNS nameserver (direct/strict):",
          default: "strict",
        });
        
        const rulesInput = await input({
          message: "DNS rules (always-resolve/remote):",
          default: "remote",
        });
        
        // Validate with Zod
        const dnsResult = DNSPolicySchema.safeParse({
          nameserver: nameserverInput,
          rules: rulesInput,
        });
        
        if (!dnsResult.success) {
          console.error("\n❌ Invalid DNS policy configuration:");
          dnsResult.error.issues.forEach((issue) => {
            console.error(`   ${issue.path.join(".")}: ${issue.message}`);
          });
          process.exit(1);
        }
        
        dnsPolicy = dnsResult.data;
      }
      
      // QUIC configuration
      const configureQuic = await confirm({
        message: "Disable QUIC?",
        default: true,
      });
      
      // Log level configuration
      const configureLogLevel = await confirm({
        message: "Configure log level?",
        default: false,
      });
      
      let logLevel: "debug" | "info" | "warning" | "error" | "silent" | undefined;
      if (configureLogLevel) {
        const logLevelInput = await input({
          message: "Log level (debug/info/warning/error/silent):",
          default: "warning",
        });
        
        // Validate with Zod
        const logLevelSchema = z.enum(["debug", "info", "warning", "error", "silent"]);
        const logLevelResult = logLevelSchema.safeParse(logLevelInput);
        
        if (!logLevelResult.success) {
          console.error("\n❌ Invalid log level. Must be one of: debug, info, warning, error, silent");
          process.exit(1);
        }
        
        logLevel = logLevelResult.data;
      }
      
      // Generate a new token
      const token = generateToken();
      const kvKey = getKVKey(token);
      
      const subInfo: ClashSubInformationCLI = {
        token: token,
        label: label,
        url: url,
        filter: {
          label: filterLabel,
          regions: regions.length > 0 ? regions : undefined,
          maxBillingRate: maxBillingRate,
          excludeRegex: excludeRegex || undefined,
        },
        dnsPolicy: dnsPolicy,
        disableQuic: configureQuic,
        logLevel: logLevel,
      };
      
      // Validate the complete subscription info with Zod
      const validationResult = ClashSubInformationSchema.safeParse(subInfo);
      if (!validationResult.success) {
        console.error("\n❌ Invalid subscription configuration:");
        validationResult.error.issues.forEach((issue) => {
          console.error(`   ${issue.path.join(".")}: ${issue.message}`);
        });
        process.exit(1);
      }
      
      const updatedAt = Date.now();
      await kvPut(kvKey, JSON.stringify(validationResult.data), { updatedAt });
      
      console.log("\n✨ Successfully added subscription!");
      logSubInfo(validationResult.data, kvKey);
      console.log("\n💡 Tip: You can retrieve the token anytime using 'get' command.");
    }
  )
  
  // Get subscription info
  .command(
    "get <token>",
    "Get subscription information",
    (yargs) => {
      return yargs.positional("token", {
        describe: "User token (sk-xxxx format)",
        type: "string",
      });
    },
    async (argv) => {
      const token = argv.token as string;
      const kvKey = getKVKey(token);
      
      const value = await kvGet(kvKey);
      if (!value) {
        console.error(`❌ No subscription found for token: ${token}`);
        console.error(`   KV Key: ${kvKey}`);
        process.exit(1);
      }
      
      try {
        const parsedValue = JSON.parse(value);
        
        // Validate with Zod
        const validationResult = ClashSubInformationSchema.safeParse(parsedValue);
        
        if (!validationResult.success) {
          console.error(`❌ Invalid subscription data format:`);
          validationResult.error.issues.forEach((issue) => {
            console.error(`   ${issue.path.join(".")}: ${issue.message}`);
          });
          console.error(`   The data in KV might be corrupted.`);
          process.exit(1);
        }
        
        logSubInfo(validationResult.data, kvKey);
      } catch (error: any) {
        console.error(`❌ Failed to parse subscription data: ${error.message}`);
        console.error(`   The data in KV might be corrupted.`);
        process.exit(1);
      }
    }
  )
  
  // Get subscription link
  .command(
    "link <token>",
    "Get subscription link and optionally open in Clash",
    (yargs) => {
      return yargs
        .positional("token", {
          describe: "User token (sk-xxxx format)",
          type: "string",
        })
        .option("base-url", {
          alias: "b",
          describe: "Base URL of your deployed worker",
          type: "string",
          default: "https://clash.jctaoo.site",
        })
        .option("go", {
          alias: "g",
          describe: "Generate and open Clash URL scheme",
          type: "boolean",
          default: false,
        });
    },
    async (argv) => {
      const token = argv.token as string;
      const baseUrl = (argv["base-url"] as string);
      const shouldGo = argv.go as boolean;
      const kvKey = getKVKey(token);
      
      const value = await kvGet(kvKey);
      if (!value) {
        console.error(`❌ No subscription found for token: ${token}`);
        console.error(`   KV Key: ${kvKey}`);
        process.exit(1);
      }
      
      try {
        const parsedValue = JSON.parse(value);
        
        // Validate with Zod
        const validationResult = ClashSubInformationSchema.safeParse(parsedValue);
        
        if (!validationResult.success) {
          console.error(`❌ Invalid subscription data format:`);
          validationResult.error.issues.forEach((issue) => {
            console.error(`   ${issue.path.join(".")}: ${issue.message}`);
          });
          console.error(`   The data in KV might be corrupted.`);
          process.exit(1);
        }
        
        const subInfo = validationResult.data;
        
        // Generate subscription link
        const normalizedBaseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
        const subLink = `${normalizedBaseUrl}/${token}`;
        
        console.log(`\n📎 Subscription Link:`);
        console.log(`  ${subLink}`);
        console.log(`\n🏷️  Label: ${subInfo.label}`);
        
        // Generate and optionally open Clash URL scheme
        if (shouldGo) {
          const encodedUrl = encodeURIComponent(subLink);
          const clashUrlScheme = `clash://install-config?url=${encodedUrl}`;
          
          console.log(`\n🚀 Opening Clash URL scheme...`);
          console.log(`  ${clashUrlScheme}`);
          
          try {
            // Detect platform and use appropriate command
            const platform = process.platform;
            let openCommand: string;
            
            if (platform === "win32") {
              openCommand = `start "" "${clashUrlScheme}"`;
            } else if (platform === "darwin") {
              openCommand = `open "${clashUrlScheme}"`;
            } else {
              openCommand = `xdg-open "${clashUrlScheme}"`;
            }
            
            await execAsync(openCommand);
            console.log(`\n✅ Successfully opened Clash URL scheme!`);
          } catch (error: any) {
            console.error(`\n❌ Failed to open URL scheme: ${error.message}`);
            console.error(`   Please manually open the URL in your Clash app.`);
          }
        }
      } catch (error: any) {
        console.error(`❌ Failed to parse subscription data: ${error.message}`);
        console.error(`   The data in KV might be corrupted.`);
        process.exit(1);
      }
    }
  )
  
  // Update subscription
  .command(
    "update <token>",
    "Update an existing subscription (opens editor)",
    (yargs) => {
      return yargs.positional("token", {
        describe: "User token (sk-xxxx format)",
        type: "string",
      });
    },
    async (argv) => {
      const token = argv.token as string;
      const kvKey = getKVKey(token);
      
      // Get existing subscription
      const existingValue = await kvGet(kvKey);
      if (!existingValue) {
        console.error(`❌ No subscription found for token: ${token}`);
        console.error(`   KV Key: ${kvKey}`);
        process.exit(1);
      }
      
      let existingSubInfo: ClashSubInformationCLI;
      try {
        const parsedValue = JSON.parse(existingValue);
        
        // Validate with Zod
        const validationResult = ClashSubInformationSchema.safeParse(parsedValue);
        
        if (!validationResult.success) {
          console.error(`❌ Invalid subscription data format:`);
          validationResult.error.issues.forEach((issue) => {
            console.error(`   ${issue.path.join(".")}: ${issue.message}`);
          });
          console.error(`   The data in KV might be corrupted.`);
          process.exit(1);
        }
        
        existingSubInfo = validationResult.data;
      } catch (error: any) {
        console.error(`❌ Failed to parse existing subscription data: ${error.message}`);
        console.error(`   The data in KV might be corrupted.`);
        process.exit(1);
      }
      
      console.log("\n✏️  Opening editor to update subscription...");
      console.log("💡 Tip: Modify the JSON and save to update the subscription.");
      console.log("⚠️  Note: The 'token' field is read-only and cannot be changed.\n");
      
      // Create a clean version for editing (without content field to keep it clean)
      const editableVersion = {
        token: existingSubInfo.token,
        label: existingSubInfo.label,
        url: existingSubInfo.url,
        filter: {
          label: existingSubInfo.filter.label,
          regions: existingSubInfo.filter.regions || [],
          maxBillingRate: existingSubInfo.filter.maxBillingRate,
          excludeRegex: existingSubInfo.filter.excludeRegex,
        },
        dnsPolicy: existingSubInfo.dnsPolicy || { nameserver: "strict", rules: "remote" },
        disableQuic: existingSubInfo.disableQuic !== undefined ? existingSubInfo.disableQuic : true,
        logLevel: existingSubInfo.logLevel || "warning",
      };
      
      const editedContent = await editor({
        message: "Edit subscription (JSON format):",
        default: JSON.stringify(editableVersion, null, 2),
        waitForUseInput: false,
        postfix: ".json",
        validate: (value) => {
          try {
            const parsedContent = JSON.parse(value);
            
            // Validate with Zod schema
            const result = ClashSubInformationSchema.safeParse(parsedContent);
            
            if (!result.success) {
              const errors = result.error.issues
                .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
                .join("\n   ");
              return `Validation failed:\n   ${errors}`;
            }
            
            return true;
          } catch (error: any) {
            return `Invalid JSON: ${error.message}`;
          }
        },
      });
      
      const parsedContent = JSON.parse(editedContent);
      
      // Validate again with Zod to ensure type safety
      const validationResult = ClashSubInformationSchema.safeParse(parsedContent);
      
      if (!validationResult.success) {
        console.error("\n❌ Invalid subscription configuration:");
        validationResult.error.issues.forEach((issue) => {
          console.error(`   ${issue.path.join(".")}: ${issue.message}`);
        });
        process.exit(1);
      }
      
      // Build updated subscription info from validated data
      const updatedSubInfo: ClashSubInformationCLI = {
        ...validationResult.data,
        token: existingSubInfo.token, // Always keep the original token
      };
      
      const updatedAt = Date.now();
      await kvPut(kvKey, JSON.stringify(updatedSubInfo), { updatedAt });
      console.log(`\n✅ Successfully updated subscription!`);
      logSubInfo(updatedSubInfo, kvKey);
    }
  )
  
  // Delete subscription
  .command(
    "delete <token>",
    "Delete a subscription",
    (yargs) => {
      return yargs.positional("token", {
        describe: "User token (sk-xxxx format)",
        type: "string",
      });
    },
    async (argv) => {
      const token = argv.token as string;
      const kvKey = getKVKey(token);
      
      await kvDelete(kvKey);
      console.log(`\n🗑️  Successfully deleted subscription for token: ${token}`);
    }
  )
  
  // List all subscriptions
  .command(
    "list",
    "List all subscriptions",
    () => {},
    async () => {
      const keys = await kvList("kv:");
      
      if (keys.length === 0) {
        console.log("\n📭 No subscriptions found.");
        return;
      }
      
      console.log(`\n📋 Found ${keys.length} subscription(s):`);
      
      for (const key of keys) {
        try {
          const value = await kvGet(key.name);
          if (value) {
            try {
              const parsedValue = JSON.parse(value);
              
              // Validate with Zod
              const validationResult = ClashSubInformationSchema.safeParse(parsedValue);
              
              if (!validationResult.success) {
                console.error(`\n❌ Error parsing ${key.name}: Invalid data format`);
                validationResult.error.issues.forEach((issue) => {
                  console.error(`   ${issue.path.join(".")}: ${issue.message}`);
                });
              } else {
                logSubInfo(validationResult.data, key.name);
              }
            } catch (parseError: any) {
              console.error(`\n❌ Error parsing ${key.name}: Invalid JSON data`);
            }
          }
        } catch (error: any) {
          console.error(`\n❌ Error reading ${key.name}: ${error.message}`);
        }
      }
    }
  )
  
  .demandCommand(1, "You need to specify a command")
  .help()
  .alias("help", "h")
  .version()
  .alias("version", "v")
  .strict()
  .parse();

