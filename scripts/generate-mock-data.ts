/**
 * Mock Data Generator for memAI Dashboard Testing
 * Generates 33 memory entries across all categories and phases
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import Memai from '../src/memai.js';

// Memory categories as defined in schema
type MemoryCategory = 
  | 'checkpoint' 
  | 'decision' 
  | 'implementation' 
  | 'issue' 
  | 'validation' 
  | 'insight' 
  | 'user-interaction';

interface MockMemory {
  category: MemoryCategory;
  phase: string;
  action: string;
  context: string;
  reasoning: string;
  outcome: string;
  tags: string;
}

/**
 * Mock memory data - exactly 33 entries
 * Distribution: checkpoint(5), decision(5), implementation(8), issue(5), validation(4), insight(3), user-interaction(3)
 */
export const mockMemories: MockMemory[] = [
  // Checkpoints (5)
  {
    category: 'checkpoint',
    phase: 'Planning',
    action: 'Completed initial project requirements gathering',
    context: 'Stakeholder meetings concluded with clear feature priorities',
    reasoning: 'Need documented requirements before architecture design',
    outcome: 'Requirements document approved by all stakeholders',
    tags: 'requirements,planning,milestone'
  },
  {
    category: 'checkpoint',
    phase: 'Development',
    action: 'Core API endpoints implemented and tested',
    context: 'All CRUD operations for memories are functional',
    reasoning: 'API foundation needed before frontend integration',
    outcome: 'API ready for frontend consumption with 95% test coverage',
    tags: 'api,backend,milestone'
  },
  {
    category: 'checkpoint',
    phase: 'Testing',
    action: 'Unit test suite completed for core modules',
    context: 'All critical business logic has test coverage',
    reasoning: 'Ensure reliability before integration testing phase',
    outcome: '156 unit tests passing with 87% code coverage',
    tags: 'testing,unit-tests,milestone'
  },
  {
    category: 'checkpoint',
    phase: 'Integration',
    action: 'Frontend-backend integration complete',
    context: 'Dashboard successfully communicates with API',
    reasoning: 'Integration milestone required before user testing',
    outcome: 'All API calls working correctly in dashboard',
    tags: 'integration,frontend,backend'
  },
  {
    category: 'checkpoint',
    phase: 'QA',
    action: 'QA sign-off received for release candidate',
    context: 'All critical and high priority bugs resolved',
    reasoning: 'QA approval required before production deployment',
    outcome: 'Release candidate approved for staging deployment',
    tags: 'qa,release,approval'
  },

  // Decisions (5)
  {
    category: 'decision',
    phase: 'Architecture',
    action: 'Selected SQLite with better-sqlite3 for data persistence',
    context: 'Evaluating database options for local-first architecture',
    reasoning: 'SQLite provides zero-config, file-based storage ideal for desktop apps',
    outcome: 'Database layer implemented with WAL mode for performance',
    tags: 'database,sqlite,architecture'
  },
  {
    category: 'decision',
    phase: 'Architecture',
    action: 'Adopted Model Context Protocol for AI agent integration',
    context: 'Need standardized interface for AI agent communication',
    reasoning: 'MCP provides industry-standard tool definitions and transport',
    outcome: 'MCP server implemented with 8 tools for memory operations',
    tags: 'mcp,ai-agent,protocol'
  },
  {
    category: 'decision',
    phase: 'Development',
    action: 'Chose React with TypeScript for dashboard frontend',
    context: 'Selecting frontend framework for web dashboard',
    reasoning: 'React ecosystem maturity and TypeScript type safety',
    outcome: 'Dashboard scaffolded with Vite and React 18',
    tags: 'react,typescript,frontend'
  },
  {
    category: 'decision',
    phase: 'Development',
    action: 'Implemented shadcn/ui for component library',
    context: 'Need consistent, accessible UI components',
    reasoning: 'shadcn/ui provides customizable, accessible primitives',
    outcome: 'Core UI components installed and themed',
    tags: 'shadcn,ui,components'
  },
  {
    category: 'decision',
    phase: 'Architecture',
    action: 'Designed session health monitoring system',
    context: 'AI agents need feedback on memory recording habits',
    reasoning: 'Nudge system encourages consistent context preservation',
    outcome: 'SessionTracker and NudgeHandler implemented',
    tags: 'session,health,monitoring'
  },

  // Implementations (8)
  {
    category: 'implementation',
    phase: 'Development',
    action: 'Implemented memory recording with embedding generation',
    context: 'Core feature for storing AI agent context',
    reasoning: 'Embeddings enable semantic search capabilities',
    outcome: 'Memories stored with async embedding generation',
    tags: 'memory,embeddings,core'
  },
  {
    category: 'implementation',
    phase: 'Development',
    action: 'Built semantic search with cosine similarity',
    context: 'Users need intelligent memory retrieval',
    reasoning: 'Vector similarity provides relevant results beyond keywords',
    outcome: 'Search returns semantically similar memories',
    tags: 'search,semantic,vectors'
  },
  {
    category: 'implementation',
    phase: 'Development',
    action: 'Created CLI interface with commander.js',
    context: 'Developers need command-line access to memAI',
    reasoning: 'CLI enables scripting and quick access',
    outcome: 'CLI supports stats, search, export, and dashboard commands',
    tags: 'cli,commands,interface'
  },
  {
    category: 'implementation',
    phase: 'Development',
    action: 'Developed StatsGrid component for dashboard',
    context: 'Dashboard needs at-a-glance statistics display',
    reasoning: 'Quick metrics help users understand system state',
    outcome: 'StatsGrid shows memories, decisions, issues, progress',
    tags: 'dashboard,stats,component'
  },
  {
    category: 'implementation',
    phase: 'Integration',
    action: 'Integrated Vite proxy for API development',
    context: 'Frontend needs to communicate with backend API',
    reasoning: 'Proxy avoids CORS issues during development',
    outcome: 'Vite dev server proxies /api to localhost:3030',
    tags: 'vite,proxy,development'
  },
  {
    category: 'implementation',
    phase: 'Development',
    action: 'Added pagination component for memory list',
    context: 'Large memory lists need pagination',
    reasoning: 'Pagination improves performance and usability',
    outcome: 'Pagination with 10 items per page implemented',
    tags: 'pagination,ui,performance'
  },
  {
    category: 'implementation',
    phase: 'Integration',
    action: 'Implemented filter controls with category dropdown',
    context: 'Users need to filter memories by various criteria',
    reasoning: 'Filtering helps find relevant memories quickly',
    outcome: 'Search, category, and view filters working',
    tags: 'filters,search,ui'
  },
  {
    category: 'implementation',
    phase: 'Development',
    action: 'Built MemoryCard component with expandable details',
    context: 'Individual memories need clear visual representation',
    reasoning: 'Cards provide scannable format with drill-down',
    outcome: 'MemoryCard shows action, category, timestamp, details',
    tags: 'memory-card,component,ui'
  },

  // Issues (5)
  {
    category: 'issue',
    phase: 'Development',
    action: 'Memory embedding generation blocking main thread',
    context: 'Large text inputs cause UI freezes',
    reasoning: 'Synchronous embedding generation impacts responsiveness',
    outcome: 'Moved embedding generation to async background process',
    tags: 'performance,embeddings,bug'
  },
  {
    category: 'issue',
    phase: 'Testing',
    action: 'E2E tests failing on CI due to timing issues',
    context: 'Playwright tests pass locally but fail in GitHub Actions',
    reasoning: 'CI environment slower than local development machine',
    outcome: 'Added explicit waits and increased timeouts',
    tags: 'e2e,ci,flaky-tests'
  },
  {
    category: 'issue',
    phase: 'Development',
    action: 'SQLite database locked during concurrent writes',
    context: 'Multiple MCP tool calls causing database conflicts',
    reasoning: 'Default SQLite mode does not handle concurrent writes well',
    outcome: 'Enabled WAL mode for better concurrency',
    tags: 'sqlite,concurrency,database'
  },
  {
    category: 'issue',
    phase: 'Testing',
    action: 'Type errors in test files after TypeScript upgrade',
    context: 'Upgraded TypeScript from 5.3 to 5.6',
    reasoning: 'Stricter type checking revealed existing issues',
    outcome: 'Fixed type annotations and added missing types',
    tags: 'typescript,types,upgrade'
  },
  {
    category: 'issue',
    phase: 'Integration',
    action: 'API response format mismatch with frontend types',
    context: 'Dashboard showing undefined values for some fields',
    reasoning: 'Backend snake_case vs frontend camelCase mismatch',
    outcome: 'Added response transformation layer in API client',
    tags: 'api,types,integration'
  },

  // Validations (4)
  {
    category: 'validation',
    phase: 'Testing',
    action: 'Property-based tests passing for filter logic',
    context: 'Testing filter functions with fast-check',
    reasoning: 'Property tests catch edge cases unit tests miss',
    outcome: 'All filter properties verified across 100 iterations',
    tags: 'property-testing,fast-check,filters'
  },
  {
    category: 'validation',
    phase: 'QA',
    action: 'Accessibility audit completed with axe-core',
    context: 'Ensuring WCAG 2.1 AA compliance',
    reasoning: 'Accessibility is a core requirement',
    outcome: 'Zero critical accessibility violations found',
    tags: 'accessibility,wcag,audit'
  },
  {
    category: 'validation',
    phase: 'Testing',
    action: 'Integration tests passing for MCP server',
    context: 'Testing all MCP tool implementations',
    reasoning: 'MCP tools are primary AI agent interface',
    outcome: 'All 8 MCP tools tested with mock clients',
    tags: 'mcp,integration,testing'
  },
  {
    category: 'validation',
    phase: 'QA',
    action: 'Performance benchmarks within acceptable range',
    context: 'Measuring API response times and memory usage',
    reasoning: 'Performance impacts user experience',
    outcome: 'P95 response time under 100ms for all endpoints',
    tags: 'performance,benchmarks,metrics'
  },

  // Insights (3)
  {
    category: 'insight',
    phase: 'Development',
    action: 'Async embedding generation improves UX significantly',
    context: 'Comparing sync vs async embedding approaches',
    reasoning: 'Non-blocking operations keep UI responsive',
    outcome: 'Adopted async pattern for all heavy computations',
    tags: 'async,performance,pattern'
  },
  {
    category: 'insight',
    phase: 'Review',
    action: 'Session health nudges increase memory recording by 40%',
    context: 'Analyzing memory recording patterns with and without nudges',
    reasoning: 'Gentle reminders help maintain context preservation habits',
    outcome: 'Nudge system validated as effective intervention',
    tags: 'nudges,behavior,metrics'
  },
  {
    category: 'insight',
    phase: 'Development',
    action: 'Semantic search outperforms keyword search for context retrieval',
    context: 'Comparing search result relevance',
    reasoning: 'Embeddings capture meaning beyond exact word matches',
    outcome: 'Prioritized semantic search in retrieval pipeline',
    tags: 'search,semantic,learning'
  },

  // User Interactions (3)
  {
    category: 'user-interaction',
    phase: 'Planning',
    action: 'User requested dark mode support for dashboard',
    context: 'Feedback from early beta testers',
    reasoning: 'Dark mode reduces eye strain for extended use',
    outcome: 'Added theme toggle with system preference detection',
    tags: 'dark-mode,feedback,ui'
  },
  {
    category: 'user-interaction',
    phase: 'Review',
    action: 'User approved new stats grid layout',
    context: 'Design review for dashboard statistics display',
    reasoning: 'User validation ensures design meets needs',
    outcome: 'Stats grid design finalized and implemented',
    tags: 'design,approval,stats'
  },
  {
    category: 'user-interaction',
    phase: 'Planning',
    action: 'User prioritized breadcrumb navigation feature',
    context: 'Feature prioritization session',
    reasoning: 'Breadcrumbs improve navigation clarity',
    outcome: 'Breadcrumb component added to sprint backlog',
    tags: 'navigation,breadcrumb,priority'
  }
];

/**
 * Generate mock data and insert into database
 */
async function generateMockData(): Promise<void> {
  console.log('🚀 Starting mock data generation...');
  console.log(`📊 Generating ${mockMemories.length} memory entries`);

  const memai = new Memai();

  // Verify we have exactly 33 entries
  if (mockMemories.length !== 33) {
    throw new Error(`Expected 33 memories, got ${mockMemories.length}`);
  }

  // Verify all categories are represented
  const categories = new Set(mockMemories.map(m => m.category));
  const expectedCategories: MemoryCategory[] = [
    'checkpoint', 'decision', 'implementation', 'issue', 
    'validation', 'insight', 'user-interaction'
  ];
  
  for (const cat of expectedCategories) {
    if (!categories.has(cat)) {
      throw new Error(`Missing category: ${cat}`);
    }
  }

  // Insert memories with slight timestamp offsets for ordering
  let insertedCount = 0;
  const baseTime = Date.now();
  
  for (let i = 0; i < mockMemories.length; i++) {
    const memory = mockMemories[i];
    
    try {
      memai.record({
        category: memory.category,
        phase: memory.phase,
        action: memory.action,
        context: memory.context,
        reasoning: memory.reasoning,
        outcome: memory.outcome,
        tags: memory.tags
      });
      insertedCount++;
      
      // Small delay to ensure unique timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    } catch (error) {
      console.error(`Failed to insert memory ${i + 1}:`, error);
    }
  }

  // Print summary
  const categoryCounts = mockMemories.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const phaseCounts = mockMemories.reduce((acc, m) => {
    acc[m.phase] = (acc[m.phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n✅ Mock data generation complete!');
  console.log(`\n📈 Inserted ${insertedCount} memories`);
  console.log('\n📂 By Category:');
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
  console.log('\n🔄 By Phase:');
  Object.entries(phaseCounts).forEach(([phase, count]) => {
    console.log(`   ${phase}: ${count}`);
  });

  memai.close();
}

// Run if executed directly
generateMockData().catch(console.error);
