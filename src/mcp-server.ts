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
import { SessionTracker, HealthMetrics } from "./session-tracker.js";
import { NudgeHandler } from "./nudge-handler.js";
import Database from "better-sqlite3";

// Initialize memAI
const dbPath = process.env.MEMAI_DB_PATH || join(process.cwd(), '.memai', 'memory.db');
const memai = new Memai(dbPath);

// Initialize SessionTracker singleton
const sessionDb = new Database(dbPath);
const sessionTracker = new SessionTracker(undefined, undefined, sessionDb);

// Initialize NudgeHandler with session tracker
const nudgeHandler = new NudgeHandler(sessionTracker);

// Attempt to restore previous session on startup
sessionTracker.restore();

/**
 * Format milliseconds as human-readable duration
 */
function formatDurationMs(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

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
            const response = {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(memories, null, 2),
                    },
                ],
            };
            // Wrap response with nudge if conditions are met (Requirements 3.1, 3.2, 3.3)
            return nudgeHandler.wrapResponse(response);
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
            limit: z.number().optional().default(100).describe("Maximum memories to return (1-100)"),
            compact: z.boolean().optional().default(true).describe("Return summary only, no memories array (default: true for context efficiency)"),
        }),
        handler: async (args: any) => {
            // Clamp limit to valid range [1, 100] (Requirements 2.2, 2.3, 2.4)
            const rawLimit = args.limit ?? 100;
            const clampedLimit = Math.max(1, Math.min(100, rawLimit));
            
            // Calculate maxDepth from limit (limit = maxDepth * 10)
            const maxDepth = Math.ceil(clampedLimit / 10);
            
            const since = Date.now() - (args.hours * 60 * 60 * 1000);
            const briefing = memai.generateBriefing({ since, maxDepth });
            
            // Get session health metrics (Requirements 2.1)
            const metrics = sessionTracker.getHealthMetrics();
            
            const sessionHealth = {
                sessionDuration: formatDurationMs(metrics.sessionDurationMs),
                toolCallCount: metrics.toolCallCount,
                memoryCount: metrics.memoryCount,
                healthStatus: metrics.status,
            };
            
            // Add warning when memoryCount=0 and toolCallCount>5 (Requirements 2.2)
            if (metrics.memoryCount === 0 && metrics.toolCallCount > 5) {
                (sessionHealth as any).warning = `⚠️ No memories recorded despite ${metrics.toolCallCount} tool calls. Consider recording your progress and decisions.`;
            }
            
            // Compact mode: return summary only (Requirements 3.1, 3.2)
            if (args.compact) {
                const compactResponse = {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({
                                summary: briefing.summary,
                                activeIssuesCount: briefing.activeIssues.length,
                                sessionHealth,
                            }, null, 2),
                        },
                    ],
                };
                return nudgeHandler.wrapResponse(compactResponse);
            }
            
            // Full mode: include memories (limited to clampedLimit)
            const limitedMemories = briefing.memories.slice(0, clampedLimit);
            
            const briefingData: any = {
                ...briefing,
                memories: limitedMemories,
                sessionHealth,
            };
            
            const response = {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(briefingData, null, 2),
                    },
                ],
            };
            
            // Wrap response with nudge if conditions are met (Requirements 3.1, 3.2, 3.3)
            return nudgeHandler.wrapResponse(response);
        },
    },

    start_session: {
        name: "start_session",
        description: "Start a new development session. Returns context, active issues, and instructions.",
        schema: z.object({
            goal: z.string().optional().describe("The main goal for this session"),
        }),
        handler: async (args: any) => {
            // Get health metrics from any prior session activity before initializing (Requirements 2.3)
            const priorMetrics = sessionTracker.getHealthMetrics();
            const hadPriorActivity = priorMetrics.toolCallCount > 0 || priorMetrics.memoryCount > 0;
            
            // Initialize fresh session (Requirements 1.1)
            sessionTracker.initialize();
            sessionTracker.persist();
            
            const since = Date.now() - (24 * 60 * 60 * 1000);
            const briefing = memai.generateBriefing({ since, maxDepth: 10 });

            const summaryParts = [
                `# 🚀 Session Started`,
                `Goal: ${args.goal || 'General Development'}`,
                ``,
                `## 📊 Current Status`,
                `- Phase: ${briefing.summary.currentPhase}`,
                `- Progress: ${briefing.summary.currentProgress}%`,
                `- Active Issues: ${briefing.summary.activeIssuesCount}`,
            ];
            
            // Include prior session health metrics if there was activity (Requirements 2.3)
            if (hadPriorActivity) {
                summaryParts.push(
                    ``,
                    `## 📈 Prior Session Health`,
                    `- Duration: ${formatDurationMs(priorMetrics.sessionDurationMs)}`,
                    `- Tool Calls: ${priorMetrics.toolCallCount}`,
                    `- Memories Recorded: ${priorMetrics.memoryCount}`,
                    `- Health Status: ${priorMetrics.status}`
                );
            }
            
            summaryParts.push(
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
            );

            return {
                content: [
                    {
                        type: "text",
                        text: summaryParts.join('\n'),
                    },
                ],
            };
        },
    },

    memory_pulse: {
        name: "memory_pulse",
        description: "Check your memory recording health. Returns session metrics and suggestions when recording has lapsed.",
        schema: z.object({}),
        handler: async (_args: any) => {
            const metrics = sessionTracker.getHealthMetrics();
            
            // Build response with required fields (Requirements 4.1, 4.3)
            const response: {
                sessionDuration: string;
                memoryCount: number;
                toolCallCount: number;
                timeSinceLastRecording: string | null;
                healthStatus: 'healthy' | 'warning' | 'critical';
                suggestions?: string[];
                guidance?: string;
            } = {
                sessionDuration: formatDurationMs(metrics.sessionDurationMs),
                memoryCount: metrics.memoryCount,
                toolCallCount: metrics.toolCallCount,
                timeSinceLastRecording: metrics.timeSinceLastRecording !== null 
                    ? formatDurationMs(metrics.timeSinceLastRecording)
                    : null,
                healthStatus: metrics.status,
            };
            
            // Include suggestions when status is warning or critical (Requirements 4.2)
            if (metrics.status === 'warning' || metrics.status === 'critical') {
                response.suggestions = [
                    'decision - Record any technical or architectural decisions made',
                    'implementation - Log progress on current tasks',
                    'issue - Document any bugs or problems encountered',
                    'insight - Capture learnings or observations',
                ];
            }
            
            // Include guidance when status is critical (Requirements 4.4)
            if (metrics.status === 'critical') {
                response.guidance = '⚠️ Memory recording has lapsed significantly. Consider:\n' +
                    '1. Recording any decisions made during this session\n' +
                    '2. Logging implementation progress on current tasks\n' +
                    '3. Documenting any issues or blockers encountered\n' +
                    '4. Creating a checkpoint if switching contexts';
            }
            
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(response, null, 2),
                    },
                ],
            };
        },
    },

    memai_recall: {
        name: "memai_recall",
        description: "Recall the last recorded memory. Use this before starting a task to reinforce context.",
        schema: z.object({}),
        handler: async (_args: any) => {
            const lastMemory = memai.getLastMemory();
            
            if (!lastMemory) {
                return {
                    content: [
                        {
                            type: "text",
                            text: "📭 No memories recorded yet. Start fresh!",
                        },
                    ],
                };
            }
            
            const timeSince = Date.now() - lastMemory.timestamp!;
            const timeSinceStr = formatDurationMs(timeSince);
            
            const parts = [
                `# 🧠 Last Memory Recall`,
                ``,
                `**Action**: ${lastMemory.action}`,
                `**Category**: ${lastMemory.category}`,
                `**Phase**: ${lastMemory.phase || 'N/A'}`,
                `**Recorded**: ${timeSinceStr} ago`,
            ];
            
            if (lastMemory.context) {
                parts.push(``, `**Context**: ${lastMemory.context}`);
            }
            if (lastMemory.reasoning) {
                parts.push(`**Reasoning**: ${lastMemory.reasoning}`);
            }
            if (lastMemory.outcome) {
                parts.push(`**Outcome**: ${lastMemory.outcome}`);
            }
            if (lastMemory.tags) {
                parts.push(`**Tags**: ${lastMemory.tags}`);
            }
            
            return {
                content: [
                    {
                        type: "text",
                        text: parts.join('\n'),
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
            // Get final session metrics before reset
            const finalMetrics = sessionTracker.getHealthMetrics();
            
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

            // 3. Reset session tracker (Requirements 1.4)
            sessionTracker.reset();
            sessionTracker.persist();

            return {
                content: [
                    {
                        type: "text",
                        text: `✅ Session finished.\n- Checkpoint created (ID: ${checkpointId})\n- Report exported to: ${reportPath}\n- Session Stats: ${finalMetrics.toolCallCount} tool calls, ${finalMetrics.memoryCount} memories recorded\n\nGood job!`,
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
    
    // Increment tool call counter for session tracking (Requirements 1.2)
    sessionTracker.incrementToolCall();
    
    // Track memory recordings (Requirements 1.3)
    if (request.params.name === 'record_memory' || request.params.name === 'record_decision') {
        sessionTracker.recordMemory();
    }
    
    // Persist session state after each tool call
    sessionTracker.persist();
    
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
