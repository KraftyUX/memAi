#!/usr/bin/env node

/**
 * memAI MCP Server
 * Enables AI agents to interact with memAI via Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import Memai from "./memai.js";
import { join } from "path";

// Initialize memAI
const dbPath = process.env.MEMAI_DB_PATH || join(process.cwd(), '.memai', 'memory.db');
const memai = new Memai(dbPath);

// Create MCP Server
const server = new Server(
    {
        name: "memai-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

interface ToolDefinition {
    name: string;
    description: string;
    schema: z.ZodObject<any>;
    handler: (args: any) => Promise<{ content: { type: string; text: string }[] }>;
}

/**
 * Tool Definitions
 */
const TOOLS: Record<string, ToolDefinition> = {
    record_memory: {
        name: "record_memory",
        description: "Record a new memory in the system. Use this to store context, actions, and outcomes.",
        schema: z.object({
            category: z.enum(['checkpoint', 'decision', 'implementation', 'issue', 'validation', 'insight', 'user-interaction'])
                .describe("Category of the memory"),
            phase: z.string().optional().describe("Current project phase (e.g., 'Planning', 'Execution')"),
            action: z.string().describe("Brief description of the action taken"),
            context: z.string().optional().describe("Context or situation leading to the action"),
            reasoning: z.string().optional().describe("Why this action was taken"),
            outcome: z.string().optional().describe("Result of the action"),
            tags: z.string().optional().describe("Comma-separated tags for searchability"),
            parentId: z.number().optional().describe("ID of a parent memory if this is related"),
        }),
        handler: async (args: any) => {
            const id = await memai.record(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `Memory recorded successfully with ID: ${id}`,
                    },
                ],
            };
        },
    },

    record_decision: {
        name: "record_decision",
        description: "Record a technical or architectural decision.",
        schema: z.object({
            decision: z.string().describe("The decision made"),
            rationale: z.string().describe("Why this option was chosen"),
            alternatives: z.string().optional().describe("Other options considered"),
            impact: z.string().optional().describe("Expected impact of the decision"),
            reversible: z.boolean().optional().default(true).describe("Is this decision reversible?"),
            memoryId: z.number().optional().describe("Link to a related memory ID"),
        }),
        handler: async (args: any) => {
            const id = memai.recordDecision(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `Decision recorded successfully with ID: ${id}`,
                    },
                ],
            };
        },
    },

    search_memories: {
        name: "search_memories",
        description: "Get all memories related to a specific phase.",
        schema: z.object({
            phase: z.string().describe("Name of the phase"),
        }),
        handler: async (args: any) => {
            const memories = memai.getPhaseContext(args.phase);
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(memories, null, 2),
                    },
                ],
            };
        },
    },

    create_checkpoint: {
        name: "create_checkpoint",
        description: "Create a progress checkpoint.",
        schema: z.object({
            phase: z.string().describe("Current phase name"),
            status: z.enum(['started', 'in-progress', 'completed', 'blocked']).describe("Current status"),
            progressPercent: z.number().min(0).max(100).describe("Progress percentage (0-100)"),
            pendingActions: z.array(z.string()).optional().describe("List of next steps"),
            blockers: z.array(z.string()).optional().describe("List of blockers"),
        }),
        handler: async (args: any) => {
            const id = memai.createCheckpoint(args);
            return {
                content: [
                    {
                        type: "text",
                        text: `Checkpoint created successfully with ID: ${id}`,
                    },
                ],
            };
        },
    },

    get_briefing: {
        name: "get_briefing",
        description: "Get a briefing of recent activities and status.",
        schema: z.object({
            hours: z.number().optional().default(24).describe("Hours to look back"),
        }),
        handler: async (args: any) => {
            const since = Date.now() - (args.hours * 60 * 60 * 1000);
            const briefing = memai.generateBriefing({ since, maxDepth: 50 });
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(briefing, null, 2),
                    },
                ],
            };
        },
    },

    start_session: {
        name: "start_session",
        description: "Start a new development session. Returns context, active issues, and instructions.",
        schema: z.object({
            goal: z.string().optional().describe("The main goal for this session"),
        }),
        handler: async (args: any) => {
            const since = Date.now() - (24 * 60 * 60 * 1000);
            const briefing = memai.generateBriefing({ since, maxDepth: 50 });

            const summary = [
                `# 🚀 Session Started`,
                `Goal: ${args.goal || 'General Development'}`,
                ``,
                `## 📊 Current Status`,
                `- Phase: ${briefing.summary.currentPhase}`,
                `- Progress: ${briefing.summary.currentProgress}%`,
                `- Active Issues: ${briefing.summary.activeIssuesCount}`,
                ``,
                `## 📋 Pending Actions`,
                ...(briefing.summary.pendingActions.length ? briefing.summary.pendingActions.map((a: string) => `- ${a}`) : ['- None']),
                ``,
                `## ⛔ Blockers`,
                ...(briefing.summary.blockers.length ? briefing.summary.blockers.map((b: string) => `- ${b}`) : ['- None']),
                ``,
                `## 🧠 Agent Instructions`,
                `1. Record every significant decision using 'record_decision'.`,
                `2. Record task completions using 'record_memory' (category: 'implementation').`,
                `3. If you encounter a bug, use 'record_memory' (category: 'issue').`,
                `4. When finished, call 'finish_session'.`
            ].join('\n');

            return {
                content: [
                    {
                        type: "text",
                        text: summary,
                    },
                ],
            };
        },
    },

    finish_session: {
        name: "finish_session",
        description: "End the current session, create a checkpoint, and export a report.",
        schema: z.object({
            phase: z.string().describe("Current phase name"),
            status: z.enum(['started', 'in-progress', 'completed', 'blocked']).describe("Current status"),
            progressPercent: z.number().min(0).max(100).describe("Progress percentage (0-100)"),
            nextSteps: z.array(z.string()).describe("List of next steps"),
            blockers: z.array(z.string()).optional().describe("List of active blockers"),
        }),
        handler: async (args: any) => {
            // 1. Create Checkpoint
            const checkpointId = memai.createCheckpoint({
                phase: args.phase,
                status: args.status,
                progressPercent: args.progressPercent,
                pendingActions: args.nextSteps,
                blockers: args.blockers || []
            });

            // 2. Export Report
            const date = new Date().toISOString().split('T')[0];
            const reportPath = join(process.cwd(), 'docs', 'sessions', `${date}-session-report.md`);

            // Ensure docs/sessions exists
            try {
                const fs = await import('fs');
                const path = await import('path');
                const sessionDir = path.join(process.cwd(), 'docs', 'sessions');
                if (!fs.existsSync(sessionDir)) {
                    fs.mkdirSync(sessionDir, { recursive: true });
                }
                memai.exportToMarkdown(reportPath);
            } catch (e) {
                console.error('Failed to export report:', e);
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `✅ Session finished.\n- Checkpoint created (ID: ${checkpointId})\n- Report exported to: ${reportPath}\n\nGood job!`,
                    },
                ],
            };
        },
    }
};

/**
 * Register Tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: Object.values(TOOLS).map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: zodToJsonSchema(tool.schema),
        })),
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = TOOLS[request.params.name];
    if (!tool) {
        throw new Error("Tool not found");
    }
    // @ts-ignore - args are validated by schema but TS doesn't know
    return await tool.handler(request.params.arguments);
});

/**
 * Helper to convert Zod schema to JSON Schema
 */
function zodToJsonSchema(schema: z.ZodObject<any>): any {
    // Simple conversion for basic types used here
    // For a production app, use 'zod-to-json-schema' package
    // This is a simplified manual conversion to avoid extra dependency for now

    const shape = schema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
        const zodValue = value as any;
        let type = 'string';
        let description = zodValue.description;
        let enumValues = undefined;

        if (zodValue instanceof z.ZodString) type = 'string';
        if (zodValue instanceof z.ZodNumber) type = 'number';
        if (zodValue instanceof z.ZodBoolean) type = 'boolean';
        if (zodValue instanceof z.ZodArray) type = 'array';
        if (zodValue instanceof z.ZodEnum) {
            type = 'string';
            enumValues = (zodValue as any)._def.values;
        }
        if (zodValue instanceof z.ZodOptional) {
            // Unwrap optional
            const inner = zodValue._def.innerType;
            if (inner instanceof z.ZodString) type = 'string';
            if (inner instanceof z.ZodNumber) type = 'number';
            if (inner instanceof z.ZodBoolean) type = 'boolean';
            if (inner instanceof z.ZodArray) type = 'array';
            if (inner instanceof z.ZodEnum) {
                type = 'string';
                enumValues = (inner as any)._def.values;
            }
            if (inner instanceof z.ZodDefault) {
                const defInner = (inner as any)._def.innerType;
                if (defInner instanceof z.ZodString) type = 'string';
                if (defInner instanceof z.ZodNumber) type = 'number';
                if (defInner instanceof z.ZodBoolean) type = 'boolean';
            }
        } else {
            required.push(key);
        }

        properties[key] = {
            type,
            description,
            ...(enumValues ? { enum: enumValues } : {}),
        };
    }

    return {
        type: "object",
        properties,
        required,
    };
}

/**
 * Start Server
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("memAI MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
