2025-09-29 12:44:15.311 | 🧠 Memory database initialized
2025-09-29 12:44:15.317 | 🧠 Loaded memory for 0 agents
2025-09-29 12:44:15.318 | 🚀 Initializing advanced memory systems...
2025-09-29 12:44:15.334 | Unified server URL not set; skipping registration
2025-09-29 12:44:15.335 | 📡 WebSocket server configured on port 3004
2025-09-29 12:44:15.335 | 🔗 Message Hub integration initialized on port 3004
2025-09-29 12:44:15.340 | 📡 Message Hub WebSocket Server started on port 3004
2025-09-29 12:44:15.340 | 🔄 Real-time notifications enabled for <1s message discovery
2025-09-29 12:44:15.341 | 🚀 Message Hub Integration started successfully
2025-09-29 12:44:15.341 | 📡 WebSocket notifications: http://localhost:3004
2025-09-29 12:44:15.341 | 🔗 MCP Server integration: http://localhost:6174
2025-09-29 12:44:15.341 | ⚡ Real-time message discovery: <1 second target achieved
2025-09-29 12:44:15.342 | 🧠 Unified Neural AI Collaboration MCP Server started on port 6174
2025-09-29 12:44:15.342 | 📡 MCP Endpoint: http://localhost:6174/mcp
2025-09-29 12:44:15.342 | 💬 AI Messaging: http://localhost:6174/ai-message
2025-09-29 12:44:15.342 | 📊 Health Check: http://localhost:6174/health
2025-09-29 12:44:15.342 | 🔧 System Status: http://localhost:6174/system/status
2025-09-29 12:44:15.342 | 📡 Message Hub WebSocket: ws://localhost:3003
2025-09-29 12:44:15.342 | ⚡ Real-time notifications: <100ms message discovery
2025-09-29 12:44:15.342 | 🌟 ADVANCED CAPABILITIES ENABLED:
2025-09-29 12:44:15.342 |    🧠 Advanced Memory Systems (Neo4j, Weaviate, Redis)
2025-09-29 12:44:15.342 |    🤖 Multi-Provider AI (OpenAI, Anthropic, Google)
2025-09-29 12:44:15.342 |    🔄 Autonomous Agent Operations
2025-09-29 12:44:15.342 |    🌐 Cross-Platform Support
2025-09-29 12:44:15.342 |    🤝 Real-Time Collaboration
2025-09-29 12:44:15.342 |    ⚖️  Consensus & Coordination
2025-09-29 12:44:15.342 |    📊 ML Integration & Analytics
2025-09-29 12:44:15.342 |    🎯 Event-Driven Orchestration
2025-09-29 12:44:15.342 | 
2025-09-29 12:44:15.343 | 🚀 Ready for Neural AI Collaboration!
2025-09-29 12:44:15.345 | 🔗 Redis client connected
2025-09-29 12:44:15.351 | ✅ Redis client initialized
2025-09-29 12:44:15.377 | ✅ Weaviate schema already exists
2025-09-29 12:44:15.835 | ✅ Neo4j schema initialized successfully
2025-09-29 12:44:15.835 | ✅ Advanced memory systems initialized successfully
2025-09-29 12:46:11.510 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:46:11.510 |   method: 'initialize',
2025-09-29 12:46:11.510 |   params: {
2025-09-29 12:46:11.510 |     protocolVersion: '2025-06-18',
2025-09-29 12:46:11.510 |     capabilities: { roots: {} },
2025-09-29 12:46:11.510 |     clientInfo: { name: 'claude-code', version: '1.0.128' }
2025-09-29 12:46:11.510 |   },
2025-09-29 12:46:11.510 |   jsonrpc: '2.0',
2025-09-29 12:46:11.510 |   id: 1
2025-09-29 12:46:11.510 | }
2025-09-29 12:46:11.510 | ✅ Unified Neural MCP request processed
2025-09-29 12:46:11.513 | 🔗 Unified Neural MCP Request received: { method: 'tools/list', jsonrpc: '2.0', id: 2 }
2025-09-29 12:46:11.514 | ✅ Unified Neural MCP request processed
2025-09-29 12:46:11.526 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:46:11.526 |   jsonrpc: '2.0',
2025-09-29 12:46:11.526 |   id: 3,
2025-09-29 12:46:11.526 |   method: 'tools/call',
2025-09-29 12:46:11.526 |   params: {
2025-09-29 12:46:11.526 |     name: 'register_agent',
2025-09-29 12:46:11.526 |     arguments: {
2025-09-29 12:46:11.526 |       agentId: 'agent-ErikaDesktop-46762-mg5f6u03',
2025-09-29 12:46:11.526 |       name: 'stdio-bridge-ErikaDesktop',
2025-09-29 12:46:11.526 |       capabilities: [Array],
2025-09-29 12:46:11.526 |       metadata: [Object]
2025-09-29 12:46:11.526 |     }
2025-09-29 12:46:11.526 |   }
2025-09-29 12:46:11.526 | }
2025-09-29 12:46:11.553 | 💾 Memory stored in Weaviate: ed4e97c0-a5bb-4256-bdd4-d9d79c6149cf
2025-09-29 12:46:12.125 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T17:46:11.530Z"), registeredBy -> String("agent-ErikaDesktop-46762-mg5f6u03"), generated -> Boolean('true'), pid -> Double(4.676200e+04), version -> String("1.0.0"), status -> String("active")}.
2025-09-29 12:46:12.125 | 
2025-09-29 12:46:12.125 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:46:12.125 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:46:12.125 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:46:12.125 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:46:12.125 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:46:12.125 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:46:12.125 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:46:12.125 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:46:12.125 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 12:46:12.125 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:46:12.126 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:46:12.126 |   gqlStatus: '22G03',
2025-09-29 12:46:12.126 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:46:12.126 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:46:12.126 |   classification: 'UNKNOWN',
2025-09-29 12:46:12.126 |   rawClassification: undefined,
2025-09-29 12:46:12.126 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:46:12.126 |   retriable: false,
2025-09-29 12:46:12.126 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T17:46:11.530Z"), registeredBy -> String("agent-ErikaDesktop-46762-mg5f6u03"), generated -> Boolean('true'), pid -> Double(4.676200e+04), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:46:12.126 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:46:12.126 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:46:12.126 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:46:12.126 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:46:12.126 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:46:12.126 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:46:12.126 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:46:12.126 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:46:12.126 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:46:12.126 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:46:12.126 |     constructor: [Function: GQLError],
2025-09-29 12:46:12.126 |     cause: undefined,
2025-09-29 12:46:12.126 |     gqlStatus: '22N01',
2025-09-29 12:46:12.126 |     gqlStatusDescription: `error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T17:46:11.530Z"), registeredBy -> String("agent-ErikaDesktop-46762-mg5f6u03"), generated -> Boolean('true'), pid -> Double(4.676200e+04), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.`,
2025-09-29 12:46:12.126 |     diagnosticRecord: {
2025-09-29 12:46:12.126 |       OPERATION: '',
2025-09-29 12:46:12.126 |       OPERATION_CODE: '0',
2025-09-29 12:46:12.126 |       CURRENT_SCHEMA: '/',
2025-09-29 12:46:12.126 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:46:12.126 |     },
2025-09-29 12:46:12.126 |     classification: 'CLIENT_ERROR',
2025-09-29 12:46:12.126 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:46:12.126 |   }
2025-09-29 12:46:12.126 | }
2025-09-29 12:46:12.127 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T17:46:11.530Z"), registeredBy -> String("agent-ErikaDesktop-46762-mg5f6u03"), generated -> Boolean('true'), pid -> Double(4.676200e+04), version -> String("1.0.0"), status -> String("active")}.
2025-09-29 12:46:12.127 | 
2025-09-29 12:46:12.127 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:46:12.127 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:46:12.127 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:46:12.127 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:46:12.127 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:46:12.127 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:46:12.127 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:46:12.127 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:46:12.127 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 12:46:12.127 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:46:12.127 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:46:12.127 |   gqlStatus: '22G03',
2025-09-29 12:46:12.127 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:46:12.127 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:46:12.127 |   classification: 'UNKNOWN',
2025-09-29 12:46:12.127 |   rawClassification: undefined,
2025-09-29 12:46:12.127 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:46:12.127 |   retriable: false,
2025-09-29 12:46:12.127 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T17:46:11.530Z"), registeredBy -> String("agent-ErikaDesktop-46762-mg5f6u03"), generated -> Boolean('true'), pid -> Double(4.676200e+04), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:46:12.127 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:46:12.127 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:46:12.127 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:46:12.127 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:46:12.127 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:46:12.127 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:46:12.127 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:46:12.127 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:46:12.127 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:46:12.127 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:46:12.127 |     constructor: [Function: GQLError],
2025-09-29 12:46:12.127 |     cause: undefined,
2025-09-29 12:46:12.127 |     gqlStatus: '22N01',
2025-09-29 12:46:12.127 |     gqlStatusDescription: `error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T17:46:11.530Z"), registeredBy -> String("agent-ErikaDesktop-46762-mg5f6u03"), generated -> Boolean('true'), pid -> Double(4.676200e+04), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.`,
2025-09-29 12:46:12.127 |     diagnosticRecord: {
2025-09-29 12:46:12.127 |       OPERATION: '',
2025-09-29 12:46:12.127 |       OPERATION_CODE: '0',
2025-09-29 12:46:12.127 |       CURRENT_SCHEMA: '/',
2025-09-29 12:46:12.127 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:46:12.127 |     },
2025-09-29 12:46:12.127 |     classification: 'CLIENT_ERROR',
2025-09-29 12:46:12.127 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:46:12.127 |   }
2025-09-29 12:46:12.127 | }
2025-09-29 12:46:30.225 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T17:46:30.090Z"), registeredBy -> String("agent-ErikaDesktop-47631-mg5f78d5"), generated -> Boolean('true'), pid -> Double(4.763100e+04), version -> String("1.0.0"), status -> String("active")}.
2025-09-29 12:46:30.225 | 
2025-09-29 12:46:30.225 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:46:30.225 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:46:30.225 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:46:30.225 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:46:30.225 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:46:30.225 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:46:30.225 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:46:30.225 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:46:30.225 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 12:46:30.225 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:46:30.225 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:46:30.225 |   gqlStatus: '22G03',
2025-09-29 12:46:30.225 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:46:30.225 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:46:30.225 |   classification: 'UNKNOWN',
2025-09-29 12:46:30.225 |   rawClassification: undefined,
2025-09-29 12:46:30.225 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:46:30.225 |   retriable: false,
2025-09-29 12:46:30.225 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T17:46:30.090Z"), registeredBy -> String("agent-ErikaDesktop-47631-mg5f78d5"), generated -> Boolean('true'), pid -> Double(4.763100e+04), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:46:30.225 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:46:30.225 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:46:30.225 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:46:30.225 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:46:30.225 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:46:30.225 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:46:30.225 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:46:30.225 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:46:12.128 | 💾 Stored shared memory (agent_registration) for agent agent-ErikaDesktop-46762-mg5f6u03 [Multi-DB]
2025-09-29 12:46:12.128 | 🤖 Agent registered: agent-ErikaDesktop-46762-mg5f6u03 (stdio-bridge-ErikaDesktop)
2025-09-29 12:46:12.130 | ✅ Unified Neural MCP request processed
2025-09-29 12:46:30.070 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:46:30.070 |   id: 1,
2025-09-29 12:46:30.070 |   jsonrpc: '2.0',
2025-09-29 12:46:30.070 |   method: 'initialize',
2025-09-29 12:46:30.070 |   params: {
2025-09-29 12:46:30.070 |     capabilities: { elicitation: {} },
2025-09-29 12:46:30.070 |     clientInfo: { name: 'codex-mcp-client', title: 'Codex', version: '0.39.0' },
2025-09-29 12:46:30.070 |     protocolVersion: '2025-06-18'
2025-09-29 12:46:30.070 |   }
2025-09-29 12:46:30.070 | }
2025-09-29 12:46:30.070 | ✅ Unified Neural MCP request processed
2025-09-29 12:46:30.090 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:46:30.090 |   jsonrpc: '2.0',
2025-09-29 12:46:30.090 |   id: 2,
2025-09-29 12:46:30.090 |   method: 'tools/call',
2025-09-29 12:46:30.090 |   params: {
2025-09-29 12:46:30.090 |     name: 'register_agent',
2025-09-29 12:46:30.090 |     arguments: {
2025-09-29 12:46:30.090 |       agentId: 'agent-ErikaDesktop-47631-mg5f78d5',
2025-09-29 12:46:30.090 |       name: 'stdio-bridge-ErikaDesktop',
2025-09-29 12:46:30.090 |       capabilities: [Array],
2025-09-29 12:46:30.090 |       metadata: [Object]
2025-09-29 12:46:30.090 |     }
2025-09-29 12:46:30.090 |   }
2025-09-29 12:46:30.090 | }
2025-09-29 12:46:30.131 | 💾 Memory stored in Weaviate: 9b0ced40-c6c0-4872-800e-5ee72f3d44f4
2025-09-29 12:46:30.226 | 💾 Stored shared memory (agent_registration) for agent agent-ErikaDesktop-47631-mg5f78d5 [Multi-DB]
2025-09-29 12:46:30.226 | 🤖 Agent registered: agent-ErikaDesktop-47631-mg5f78d5 (stdio-bridge-ErikaDesktop)
2025-09-29 12:46:30.226 | ✅ Unified Neural MCP request processed
2025-09-29 12:46:32.182 | 🔗 Unified Neural MCP Request received: { id: 3, jsonrpc: '2.0', method: 'tools/list' }
2025-09-29 12:46:32.185 | ✅ Unified Neural MCP request processed
2025-09-29 12:53:58.848 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:53:58.848 |   method: 'tools/call',
2025-09-29 12:53:58.848 |   params: {
2025-09-29 12:53:58.848 |     name: 'register_agent',
2025-09-29 12:53:58.848 |     arguments: {
2025-09-29 12:53:58.848 |       agentId: 'claude-code',
2025-09-29 12:53:58.848 |       name: 'Claude Code',
2025-09-29 12:53:58.848 |       capabilities: [Array],
2025-09-29 12:53:58.848 |       metadata: [Object]
2025-09-29 12:53:58.848 |     },
2025-09-29 12:53:58.848 |     _meta: { 'claudecode/toolUseId': 'toolu_01KNvgnAnYaA2XBpnPzteQ3K' }
2025-09-29 12:53:58.848 |   },
2025-09-29 12:53:58.848 |   jsonrpc: '2.0',
2025-09-29 12:53:58.848 |   id: 4
2025-09-29 12:53:58.848 | }
2025-09-29 12:53:58.900 | 💾 Memory stored in Weaviate: c7d093be-f42a-43a6-a018-cd3a0fbf96f0
2025-09-29 12:53:58.937 | 💾 Stored shared memory (agent_registration) for agent claude-code [Multi-DB]
2025-09-29 12:53:58.937 | 🤖 Agent registered: claude-code (Claude Code)
2025-09-29 12:53:58.937 | ✅ Unified Neural MCP request processed
2025-09-29 12:54:56.535 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:54:56.535 |   id: 4,
2025-09-29 12:54:56.535 |   jsonrpc: '2.0',
2025-09-29 12:54:56.535 |   method: 'tools/call',
2025-09-29 12:54:56.535 |   params: { arguments: { agentId: 'codex-cli' }, name: 'get_agent_status' }
2025-09-29 12:54:56.535 | }
2025-09-29 12:54:56.539 | 🔍 Performing semantic search with Weaviate: ""agentId":"codex-cli""
2025-09-29 12:54:56.629 | 🕸️ Performing relationship search with Neo4j: ""agentId":"codex-cli""
2025-09-29 12:54:57.203 | ✅ Unified Neural MCP request processed
2025-09-29 12:55:08.453 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:55:08.453 |   id: 5,
2025-09-29 12:55:08.453 |   jsonrpc: '2.0',
2025-09-29 12:55:08.453 |   method: 'tools/call',
2025-09-29 12:55:08.453 |   params: {
2025-09-29 12:55:08.453 |     arguments: {
2025-09-29 12:55:08.453 |       agentId: 'codex-cli',
2025-09-29 12:55:08.453 |       capabilities: [Array],
2025-09-29 12:55:08.453 |       metadata: [Object],
2025-09-29 12:55:08.453 |       name: 'Codex CLI'
2025-09-29 12:55:08.453 |     },
2025-09-29 12:55:08.453 |     name: 'register_agent'
2025-09-29 12:55:08.453 |   }
2025-09-29 12:55:08.453 | }
2025-09-29 12:55:08.469 | 💾 Memory stored in Weaviate: 93d87186-5978-46df-967a-9719e4b6c107
2025-09-29 12:55:08.532 | 💾 Stored shared memory (agent_registration) for agent codex-cli [Multi-DB]
2025-09-29 12:55:08.532 | 🤖 Agent registered: codex-cli (Codex CLI)
2025-09-29 12:55:08.532 | ✅ Unified Neural MCP request processed
2025-09-29 12:55:22.393 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:55:22.393 |   id: 6,
2025-09-29 12:55:22.393 |   jsonrpc: '2.0',
2025-09-29 12:55:22.393 |   method: 'tools/call',
2025-09-29 12:55:22.393 |   params: {
2025-09-29 12:55:22.393 |     arguments: { agentId: 'codex-cli', behaviorSettings: [Object] },
2025-09-29 12:55:22.393 |     name: 'configure_agent_behavior'
2025-09-29 12:55:22.393 |   }
2025-09-29 12:55:22.393 | }
2025-09-29 12:55:22.404 | 💾 Memory stored in Weaviate: f59e2da2-160a-4a69-a111-a533ff87a6cd
2025-09-29 12:55:22.424 | 💾 Stored shared memory (behavior_config) for agent codex-cli [Multi-DB]
2025-09-29 12:55:22.424 | ✅ Unified Neural MCP request processed
2025-09-29 12:55:26.334 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:55:26.334 |   id: 7,
2025-09-29 12:55:26.334 |   jsonrpc: '2.0',
2025-09-29 12:55:26.334 |   method: 'tools/call',
2025-09-29 12:55:26.334 |   params: {
2025-09-29 12:55:26.334 |     arguments: {
2025-09-29 12:55:26.334 |       agentId: 'codex-cli',
2025-09-29 12:55:26.334 |       dailyBudget: 30000,
2025-09-29 12:55:26.334 |       hourlyBudget: 5000,
2025-09-29 12:55:26.334 |       priorityTasks: [Array]
2025-09-29 12:55:26.334 |     },
2025-09-29 12:55:26.334 |     name: 'set_token_budget'
2025-09-29 12:55:26.334 |   }
2025-09-29 12:55:26.334 | }
2025-09-29 12:55:26.348 | 💾 Memory stored in Weaviate: 72df78cd-8abd-4833-bf0f-687d50fde7a4
2025-09-29 12:55:26.356 | 💾 Stored shared memory (token_budget) for agent codex-cli [Multi-DB]
2025-09-29 12:55:26.357 | ✅ Unified Neural MCP request processed
2025-09-29 12:55:35.289 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:55:35.289 |   id: 8,
2025-09-29 12:55:35.289 |   jsonrpc: '2.0',
2025-09-29 12:55:35.289 |   method: 'tools/call',
2025-09-29 12:55:35.289 |   params: { arguments: { agentId: 'codex-cli' }, name: 'get_agent_status' }
2025-09-29 12:55:35.289 | }
2025-09-29 12:55:35.290 | 🔍 Performing semantic search with Weaviate: ""agentId":"codex-cli""
2025-09-29 12:55:35.348 | 🕸️ Performing relationship search with Neo4j: ""agentId":"codex-cli""
2025-09-29 12:55:35.362 | 🔍 Cached search results for: ""agentId":"codex-cli"" (6 results)
2025-09-29 12:55:35.362 | ✅ Unified Neural MCP request processed
2025-09-29 12:55:44.095 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:55:44.095 |   id: 9,
2025-09-29 12:55:44.095 |   jsonrpc: '2.0',
2025-09-29 12:55:44.095 |   method: 'tools/call',
2025-09-29 12:55:44.095 |   params: {
2025-09-29 12:55:44.095 |     arguments: {
2025-09-29 12:55:44.095 |       broadcast: true,
2025-09-29 12:55:44.095 |       content: 'Codex CLI is now signed in and ready to collaborate. Ping me with tasks or handoffs.',
2025-09-29 12:55:44.095 |       from: 'codex-cli',
2025-09-29 12:55:44.095 |       messageType: 'status',
2025-09-29 12:55:44.095 |       priority: 'normal',
2025-09-29 12:55:44.095 |       to: '*'
2025-09-29 12:55:44.095 |     },
2025-09-29 12:55:44.095 |     name: 'send_ai_message'
2025-09-29 12:55:44.095 |   }
2025-09-29 12:55:44.095 | }
2025-09-29 12:55:44.097 | 🔍 Performing semantic search with Weaviate: "agent_registration"
2025-09-29 12:55:44.154 | 🕸️ Performing relationship search with Neo4j: "agent_registration"
2025-09-29 12:55:44.178 | 🔍 Cached search results for: "agent_registration" (3 results)
2025-09-29 12:55:44.189 | 💾 Stored shared memory (ai_message) for agent codex-cli [Multi-DB]
2025-09-29 12:55:44.190 | ⚡ Real-time delivery: codex-cli → cursor-agent
2025-09-29 12:55:44.191 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 12:55:44.191 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 12:55:44.192 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 12:55:44.192 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 12:55:44.192 | 📨 Agent cursor-agent notified of message from codex-cli
2025-09-29 12:55:44.192 | ✅ Message delivered to cursor-agent
2025-09-29 12:55:44.205 | 🔄 Updated shared memory: 7b78f8a9-75c9-48d4-967c-72486a0da92c
2025-09-29 12:55:44.205 | 💾 Updated delivery status to 'delivered' for message 7b78f8a9-75c9-48d4-967c-72486a0da92c
2025-09-29 12:55:44.216 | 💾 Stored shared memory (ai_message) for agent codex-cli [Multi-DB]
2025-09-29 12:55:44.216 | ⚡ Real-time delivery: codex-cli → agent-ErikaDesktop-46762-mg5f6u03
2025-09-29 12:55:44.216 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 12:55:44.216 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 12:55:44.216 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 12:55:44.216 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 12:55:44.216 | 📨 Agent agent-ErikaDesktop-46762-mg5f6u03 notified of message from codex-cli
2025-09-29 12:55:44.216 | ✅ Message delivered to agent-ErikaDesktop-46762-mg5f6u03
2025-09-29 12:55:44.225 | 🔄 Updated shared memory: 8485d00f-581c-4a7f-8cdd-f2b01056ec73
2025-09-29 12:55:44.226 | 💾 Updated delivery status to 'delivered' for message 8485d00f-581c-4a7f-8cdd-f2b01056ec73
2025-09-29 12:55:44.235 | 💾 Stored shared memory (ai_message) for agent codex-cli [Multi-DB]
2025-09-29 12:55:44.235 | ⚡ Real-time delivery: codex-cli → agent-ErikaDesktop-47631-mg5f78d5
2025-09-29 12:55:44.235 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 12:55:44.235 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 12:55:44.236 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 12:55:44.236 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 12:55:44.236 | 📨 Agent agent-ErikaDesktop-47631-mg5f78d5 notified of message from codex-cli
2025-09-29 12:55:44.236 | ✅ Message delivered to agent-ErikaDesktop-47631-mg5f78d5
2025-09-29 12:55:44.244 | 🔄 Updated shared memory: a742f62a-b36f-4f81-802d-cf6ce20980b0
2025-09-29 12:55:44.244 | 💾 Updated delivery status to 'delivered' for message a742f62a-b36f-4f81-802d-cf6ce20980b0
2025-09-29 12:55:44.245 | ✅ Unified Neural MCP request processed
2025-09-29 12:59:07.064 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:59:07.064 |   id: 10,
2025-09-29 12:59:07.064 |   jsonrpc: '2.0',
2025-09-29 12:59:07.064 |   method: 'tools/call',
2025-09-29 12:59:07.064 |   params: { arguments: { agentId: 'claude' }, name: 'get_agent_status' }
2025-09-29 12:59:07.064 | }
2025-09-29 12:59:07.065 | 🔍 Performing semantic search with Weaviate: ""agentId":"claude""
2025-09-29 12:59:07.090 | 🕸️ Performing relationship search with Neo4j: ""agentId":"claude""
2025-09-29 12:59:07.102 | 🔍 Cached search results for: ""agentId":"claude"" (2 results)
2025-09-29 12:59:07.102 | ✅ Unified Neural MCP request processed
2025-09-29 12:59:14.892 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:59:14.892 |   id: 11,
2025-09-29 12:59:14.892 |   jsonrpc: '2.0',
2025-09-29 12:59:14.892 |   method: 'tools/call',
2025-09-29 12:59:14.892 |   params: {
2025-09-29 12:59:14.892 |     arguments: { limit: 5, query: 'Philly Wings Project common memory' },
2025-09-29 12:59:14.892 |     name: 'search_entities'
2025-09-29 12:59:14.892 |   }
2025-09-29 12:59:14.892 | }
2025-09-29 12:59:14.893 | 🔍 Performing semantic search with Weaviate: "Philly Wings Project common memory"
2025-09-29 12:59:14.923 | 🕸️ Performing relationship search with Neo4j: "Philly Wings Project common memory"
2025-09-29 12:59:14.933 | ✅ Unified Neural MCP request processed
2025-09-29 12:59:22.987 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:59:22.987 |   id: 12,
2025-09-29 12:59:22.987 |   jsonrpc: '2.0',
2025-09-29 12:59:22.987 |   method: 'tools/call',
2025-09-29 12:59:22.987 |   params: { arguments: { entities: [Array] }, name: 'create_entities' }
2025-09-29 12:59:22.987 | }
2025-09-29 12:59:23.228 | 💾 Memory stored in Weaviate: 255db7c7-693b-4d1a-8162-4c2c6be3dde7
2025-09-29 12:59:23.231 | 💾 Memory stored in Weaviate: 304cb865-d5eb-418a-bfe7-f905b405edb9
2025-09-29 12:59:23.498 | 💾 Stored shared memory (entity) for agent unified-neural-mcp-server [Multi-DB]
2025-09-29 12:59:23.498 | 🧠 Advanced Memory: create operation for Philly Wings Project
2025-09-29 12:59:23.510 | 💾 Stored shared memory (entity) for agent unified-neural-mcp-server [Multi-DB]
2025-09-29 12:59:23.510 | 🧠 Advanced Memory: create operation for Philly Wings Common Memory
2025-09-29 12:46:30.225 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:46:30.225 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:46:30.225 |     constructor: [Function: GQLError],
2025-09-29 12:46:30.225 |     cause: undefined,
2025-09-29 12:46:30.225 |     gqlStatus: '22N01',
2025-09-29 12:46:30.225 |     gqlStatusDescription: `error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T17:46:30.090Z"), registeredBy -> String("agent-ErikaDesktop-47631-mg5f78d5"), generated -> Boolean('true'), pid -> Double(4.763100e+04), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.`,
2025-09-29 12:46:30.225 |     diagnosticRecord: {
2025-09-29 12:46:30.225 |       OPERATION: '',
2025-09-29 12:46:30.225 |       OPERATION_CODE: '0',
2025-09-29 12:46:30.225 |       CURRENT_SCHEMA: '/',
2025-09-29 12:46:30.225 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:46:30.225 |     },
2025-09-29 12:46:30.225 |     classification: 'CLIENT_ERROR',
2025-09-29 12:46:30.225 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:46:30.225 |   }
2025-09-29 12:46:30.225 | }
2025-09-29 12:46:30.225 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T17:46:30.090Z"), registeredBy -> String("agent-ErikaDesktop-47631-mg5f78d5"), generated -> Boolean('true'), pid -> Double(4.763100e+04), version -> String("1.0.0"), status -> String("active")}.
2025-09-29 12:46:30.225 | 
2025-09-29 12:46:30.225 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:46:30.225 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:46:30.225 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:46:30.225 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:46:30.225 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:46:30.225 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:46:30.225 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:46:30.225 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:46:30.225 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 12:46:30.225 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:46:30.225 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:46:30.225 |   gqlStatus: '22G03',
2025-09-29 12:46:30.225 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:46:30.225 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:46:30.225 |   classification: 'UNKNOWN',
2025-09-29 12:46:30.225 |   rawClassification: undefined,
2025-09-29 12:46:30.225 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:46:30.225 |   retriable: false,
2025-09-29 12:46:30.225 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T17:46:30.090Z"), registeredBy -> String("agent-ErikaDesktop-47631-mg5f78d5"), generated -> Boolean('true'), pid -> Double(4.763100e+04), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:46:30.225 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:46:30.225 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:46:30.225 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:46:30.225 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:46:30.225 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:46:30.225 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:46:30.225 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:46:30.225 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:46:30.225 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:46:30.225 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:46:30.225 |     constructor: [Function: GQLError],
2025-09-29 12:46:30.225 |     cause: undefined,
2025-09-29 12:46:30.225 |     gqlStatus: '22N01',
2025-09-29 12:46:30.225 |     gqlStatusDescription: `error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T17:46:30.090Z"), registeredBy -> String("agent-ErikaDesktop-47631-mg5f78d5"), generated -> Boolean('true'), pid -> Double(4.763100e+04), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.`,
2025-09-29 12:46:30.225 |     diagnosticRecord: {
2025-09-29 12:46:30.225 |       OPERATION: '',
2025-09-29 12:46:30.225 |       OPERATION_CODE: '0',
2025-09-29 12:46:30.225 |       CURRENT_SCHEMA: '/',
2025-09-29 12:46:30.225 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:46:30.225 |     },
2025-09-29 12:46:30.225 |     classification: 'CLIENT_ERROR',
2025-09-29 12:46:30.225 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:46:30.225 |   }
2025-09-29 12:46:30.225 | }
2025-09-29 12:53:58.935 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T17:53:58.848Z"), environment -> String("development"), registeredBy -> String("claude-code"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")}.
2025-09-29 12:53:58.935 | 
2025-09-29 12:53:58.935 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:53:58.935 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:53:58.935 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:53:58.935 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:53:58.935 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:53:58.935 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:53:58.935 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:53:58.935 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:53:58.935 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 12:53:58.935 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:53:58.935 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:53:58.935 |   gqlStatus: '22G03',
2025-09-29 12:53:58.935 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:53:58.935 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:53:58.935 |   classification: 'UNKNOWN',
2025-09-29 12:53:58.935 |   rawClassification: undefined,
2025-09-29 12:53:58.935 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:53:58.935 |   retriable: false,
2025-09-29 12:53:58.935 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T17:53:58.848Z"), environment -> String("development"), registeredBy -> String("claude-code"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:53:58.935 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:53:58.935 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:53:58.935 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:53:58.935 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:53:58.935 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:53:58.935 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:53:58.935 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:53:58.935 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:53:58.935 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:53:58.935 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:53:58.935 |     constructor: [Function: GQLError],
2025-09-29 12:53:58.935 |     cause: undefined,
2025-09-29 12:53:58.935 |     gqlStatus: '22N01',
2025-09-29 12:53:58.935 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T17:53:58.848Z"), environment -> String("development"), registeredBy -> String("claude-code"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 12:53:58.935 |     diagnosticRecord: {
2025-09-29 12:53:58.936 |       OPERATION: '',
2025-09-29 12:53:58.936 |       OPERATION_CODE: '0',
2025-09-29 12:53:58.936 |       CURRENT_SCHEMA: '/',
2025-09-29 12:53:58.936 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:53:58.936 |     },
2025-09-29 12:53:58.936 |     classification: 'CLIENT_ERROR',
2025-09-29 12:53:58.936 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:53:58.936 |   }
2025-09-29 12:53:58.936 | }
2025-09-29 12:53:58.937 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T17:53:58.848Z"), environment -> String("development"), registeredBy -> String("claude-code"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")}.
2025-09-29 12:53:58.937 | 
2025-09-29 12:53:58.937 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:53:58.937 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:53:58.937 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:53:58.937 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:53:58.937 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:53:58.937 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:53:58.937 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:53:58.937 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:53:58.937 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 12:53:58.937 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:53:58.937 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:53:58.937 |   gqlStatus: '22G03',
2025-09-29 12:53:58.937 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:53:58.937 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:53:58.937 |   classification: 'UNKNOWN',
2025-09-29 12:53:58.937 |   rawClassification: undefined,
2025-09-29 12:53:58.937 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:53:58.937 |   retriable: false,
2025-09-29 12:53:58.937 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T17:53:58.848Z"), environment -> String("development"), registeredBy -> String("claude-code"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:53:58.937 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:53:58.937 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:53:58.937 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:53:58.937 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:53:58.937 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:53:58.937 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:53:58.937 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:53:58.937 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:53:58.937 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:53:58.937 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:53:58.937 |     constructor: [Function: GQLError],
2025-09-29 12:53:58.937 |     cause: undefined,
2025-09-29 12:53:58.937 |     gqlStatus: '22N01',
2025-09-29 12:53:58.937 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T17:53:58.848Z"), environment -> String("development"), registeredBy -> String("claude-code"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 12:53:58.937 |     diagnosticRecord: {
2025-09-29 12:53:58.937 |       OPERATION: '',
2025-09-29 12:53:58.937 |       OPERATION_CODE: '0',
2025-09-29 12:53:58.937 |       CURRENT_SCHEMA: '/',
2025-09-29 12:53:58.937 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:53:58.937 |     },
2025-09-29 12:53:58.937 |     classification: 'CLIENT_ERROR',
2025-09-29 12:53:58.937 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:53:58.937 |   }
2025-09-29 12:53:58.937 | }
2025-09-29 12:55:08.532 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T17:55:08.452Z"), workspace -> String("/home/tomcat65/projects/dev/philly-wings"), registeredBy -> String("codex-cli"), version -> String("1.0.0"), status -> String("active")}.
2025-09-29 12:55:08.532 | 
2025-09-29 12:55:08.532 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:55:08.532 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:55:08.532 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:55:08.532 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:55:08.532 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:55:08.532 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:55:08.532 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:55:08.532 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:55:08.532 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 12:55:08.532 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:55:08.532 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:55:08.532 |   gqlStatus: '22G03',
2025-09-29 12:55:08.532 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:55:08.532 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:55:08.532 |   classification: 'UNKNOWN',
2025-09-29 12:55:08.532 |   rawClassification: undefined,
2025-09-29 12:55:08.532 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:55:08.532 |   retriable: false,
2025-09-29 12:55:08.532 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T17:55:08.452Z"), workspace -> String("/home/tomcat65/projects/dev/philly-wings"), registeredBy -> String("codex-cli"), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:55:08.532 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:55:08.532 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:55:08.532 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:55:08.532 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:55:08.532 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:55:08.532 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:55:08.532 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:55:08.532 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:55:08.532 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:55:08.532 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:55:08.532 |     constructor: [Function: GQLError],
2025-09-29 12:55:08.532 |     cause: undefined,
2025-09-29 12:55:08.532 |     gqlStatus: '22N01',
2025-09-29 12:55:08.532 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T17:55:08.452Z"), workspace -> String("/home/tomcat65/projects/dev/philly-wings"), registeredBy -> String("codex-cli"), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 12:55:08.532 |     diagnosticRecord: {
2025-09-29 12:55:08.532 |       OPERATION: '',
2025-09-29 12:55:08.532 |       OPERATION_CODE: '0',
2025-09-29 12:55:08.532 |       CURRENT_SCHEMA: '/',
2025-09-29 12:55:08.532 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:55:08.532 |     },
2025-09-29 12:55:08.532 |     classification: 'CLIENT_ERROR',
2025-09-29 12:55:08.532 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:55:08.532 |   }
2025-09-29 12:55:08.532 | }
2025-09-29 12:55:08.532 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T17:55:08.452Z"), workspace -> String("/home/tomcat65/projects/dev/philly-wings"), registeredBy -> String("codex-cli"), version -> String("1.0.0"), status -> String("active")}.
2025-09-29 12:55:08.532 | 
2025-09-29 12:55:08.532 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:55:08.532 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:55:08.532 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:55:08.532 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:55:08.532 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:55:08.532 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:55:08.532 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:55:08.532 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:55:08.532 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 12:55:08.532 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:55:08.532 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:55:08.532 |   gqlStatus: '22G03',
2025-09-29 12:55:08.532 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:55:08.532 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:55:08.532 |   classification: 'UNKNOWN',
2025-09-29 12:55:08.532 |   rawClassification: undefined,
2025-09-29 12:55:08.532 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:55:08.532 |   retriable: false,
2025-09-29 12:55:08.532 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T17:55:08.452Z"), workspace -> String("/home/tomcat65/projects/dev/philly-wings"), registeredBy -> String("codex-cli"), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:55:08.532 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:55:08.532 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:55:08.532 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:55:08.532 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:55:08.532 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:55:08.532 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:55:08.532 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:55:08.532 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:55:08.532 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:55:08.532 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:55:08.532 |     constructor: [Function: GQLError],
2025-09-29 12:55:08.532 |     cause: undefined,
2025-09-29 12:55:08.532 |     gqlStatus: '22N01',
2025-09-29 12:55:08.532 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T17:55:08.452Z"), workspace -> String("/home/tomcat65/projects/dev/philly-wings"), registeredBy -> String("codex-cli"), version -> String("1.0.0"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 12:55:08.532 |     diagnosticRecord: {
2025-09-29 12:55:08.532 |       OPERATION: '',
2025-09-29 12:55:08.532 |       OPERATION_CODE: '0',
2025-09-29 12:55:08.532 |       CURRENT_SCHEMA: '/',
2025-09-29 12:55:08.532 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:55:08.532 |     },
2025-09-29 12:55:08.532 |     classification: 'CLIENT_ERROR',
2025-09-29 12:55:08.532 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:55:08.532 |   }
2025-09-29 12:55:08.532 | }
2025-09-29 12:55:22.423 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{}.
2025-09-29 12:55:22.423 | 
2025-09-29 12:55:22.423 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:55:22.423 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:55:22.423 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:55:22.423 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:55:22.423 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:55:22.423 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:55:22.423 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:55:22.423 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:55:22.423 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1532:40)
2025-09-29 12:55:22.423 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:55:22.423 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:55:22.423 |   gqlStatus: '22G03',
2025-09-29 12:55:22.423 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:55:22.423 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:55:22.423 |   classification: 'UNKNOWN',
2025-09-29 12:55:22.423 |   rawClassification: undefined,
2025-09-29 12:55:22.423 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:55:22.423 |   retriable: false,
2025-09-29 12:55:22.423 |   [cause]: GQLError: 22N01: Expected the value Map{} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:55:22.423 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:55:22.423 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:55:22.423 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:55:22.423 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:55:22.423 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:55:22.423 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:55:22.423 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:55:22.423 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:55:22.423 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:55:22.423 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:55:22.423 |     constructor: [Function: GQLError],
2025-09-29 12:55:22.423 |     cause: undefined,
2025-09-29 12:55:22.423 |     gqlStatus: '22N01',
2025-09-29 12:55:22.423 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 12:55:22.423 |     diagnosticRecord: {
2025-09-29 12:55:22.423 |       OPERATION: '',
2025-09-29 12:55:22.423 |       OPERATION_CODE: '0',
2025-09-29 12:55:22.423 |       CURRENT_SCHEMA: '/',
2025-09-29 12:55:22.423 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:55:22.423 |     },
2025-09-29 12:55:22.423 |     classification: 'CLIENT_ERROR',
2025-09-29 12:55:22.423 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:55:22.423 |   }
2025-09-29 12:55:22.423 | }
2025-09-29 12:55:22.424 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{}.
2025-09-29 12:55:22.424 | 
2025-09-29 12:55:22.424 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:55:22.424 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:55:22.424 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:55:22.424 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:55:22.424 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:55:22.424 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:55:22.424 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:55:22.424 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:55:22.424 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1532:40)
2025-09-29 12:55:22.424 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:55:22.424 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:55:22.424 |   gqlStatus: '22G03',
2025-09-29 12:55:22.424 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:55:22.424 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:55:22.424 |   classification: 'UNKNOWN',
2025-09-29 12:55:22.424 |   rawClassification: undefined,
2025-09-29 12:55:22.424 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:55:22.424 |   retriable: false,
2025-09-29 12:55:22.424 |   [cause]: GQLError: 22N01: Expected the value Map{} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:55:22.424 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:55:22.424 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:55:22.424 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:55:22.424 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:55:22.424 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:55:22.424 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:55:22.424 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:55:22.424 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:55:22.424 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:55:22.424 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:55:22.424 |     constructor: [Function: GQLError],
2025-09-29 12:55:22.424 |     cause: undefined,
2025-09-29 12:55:22.424 |     gqlStatus: '22N01',
2025-09-29 12:55:22.424 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 12:55:22.424 |     diagnosticRecord: {
2025-09-29 12:55:22.424 |       OPERATION: '',
2025-09-29 12:55:22.424 |       OPERATION_CODE: '0',
2025-09-29 12:55:22.424 |       CURRENT_SCHEMA: '/',
2025-09-29 12:55:22.424 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:55:22.424 |     },
2025-09-29 12:55:22.424 |     classification: 'CLIENT_ERROR',
2025-09-29 12:55:22.424 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:55:22.424 |   }
2025-09-29 12:55:22.424 | }
2025-09-29 12:55:26.356 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{}.
2025-09-29 12:55:26.357 | 
2025-09-29 12:55:26.357 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:55:26.357 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:55:26.357 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:55:26.357 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:55:26.357 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:55:26.357 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:55:26.357 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:55:26.357 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:55:26.357 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1578:38)
2025-09-29 12:55:26.357 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:55:26.357 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:55:26.357 |   gqlStatus: '22G03',
2025-09-29 12:55:26.357 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:55:26.357 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:55:26.357 |   classification: 'UNKNOWN',
2025-09-29 12:55:26.357 |   rawClassification: undefined,
2025-09-29 12:55:26.357 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:55:26.357 |   retriable: false,
2025-09-29 12:55:26.357 |   [cause]: GQLError: 22N01: Expected the value Map{} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:55:26.357 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:55:26.357 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:55:26.357 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:55:26.357 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:55:26.357 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:55:26.357 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:55:26.357 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:55:26.357 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:55:26.357 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:55:26.357 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:55:26.357 |     constructor: [Function: GQLError],
2025-09-29 12:55:26.357 |     cause: undefined,
2025-09-29 12:55:26.357 |     gqlStatus: '22N01',
2025-09-29 12:55:26.357 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 12:55:26.357 |     diagnosticRecord: {
2025-09-29 12:55:26.357 |       OPERATION: '',
2025-09-29 12:55:26.357 |       OPERATION_CODE: '0',
2025-09-29 12:55:26.357 |       CURRENT_SCHEMA: '/',
2025-09-29 12:55:26.357 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:55:26.357 |     },
2025-09-29 12:55:26.357 |     classification: 'CLIENT_ERROR',
2025-09-29 12:55:26.357 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:55:26.357 |   }
2025-09-29 12:55:26.357 | }
2025-09-29 12:55:26.357 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{}.
2025-09-29 12:55:26.357 | 
2025-09-29 12:55:26.357 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:55:26.357 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:55:26.357 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:55:26.357 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:55:26.357 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:55:26.357 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:55:26.357 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:55:26.357 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:55:26.357 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1578:38)
2025-09-29 12:55:26.357 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 12:55:26.357 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:55:26.357 |   gqlStatus: '22G03',
2025-09-29 12:55:26.357 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:55:26.357 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:55:26.357 |   classification: 'UNKNOWN',
2025-09-29 12:55:26.357 |   rawClassification: undefined,
2025-09-29 12:55:26.357 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:55:26.357 |   retriable: false,
2025-09-29 12:55:26.357 |   [cause]: GQLError: 22N01: Expected the value Map{} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:55:26.357 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:55:26.357 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:55:26.357 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:55:26.357 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:55:26.357 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:55:26.357 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:55:26.357 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:55:26.357 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:55:26.357 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:55:26.357 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:55:26.357 |     constructor: [Function: GQLError],
2025-09-29 12:55:26.357 |     cause: undefined,
2025-09-29 12:55:26.357 |     gqlStatus: '22N01',
2025-09-29 12:55:26.357 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 12:55:26.357 |     diagnosticRecord: {
2025-09-29 12:55:26.357 |       OPERATION: '',
2025-09-29 12:55:26.357 |       OPERATION_CODE: '0',
2025-09-29 12:55:26.357 |       CURRENT_SCHEMA: '/',
2025-09-29 12:55:26.357 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:55:26.357 |     },
2025-09-29 12:55:26.357 |     classification: 'CLIENT_ERROR',
2025-09-29 12:55:26.357 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:55:26.357 |   }
2025-09-29 12:55:26.357 | }
2025-09-29 12:59:23.498 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')}.
2025-09-29 12:59:23.498 | 
2025-09-29 12:59:23.498 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:59:23.498 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:59:23.498 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:59:23.498 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:59:23.498 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:59:23.498 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:59:23.498 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:59:23.498 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:59:23.498 |     at async file:///app/dist/unified-neural-mcp-server.js:833:42
2025-09-29 12:59:23.498 |     at async Promise.all (index 0) {
2025-09-29 12:59:23.498 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:59:23.498 |   gqlStatus: '22G03',
2025-09-29 12:59:23.498 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:59:23.498 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:59:23.498 |   classification: 'UNKNOWN',
2025-09-29 12:59:23.498 |   rawClassification: undefined,
2025-09-29 12:59:23.498 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:59:23.498 |   retriable: false,
2025-09-29 12:59:23.498 |   [cause]: GQLError: 22N01: Expected the value Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:59:23.498 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:59:23.498 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:59:23.498 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:59:23.498 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:59:23.498 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:59:23.498 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:59:23.498 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:59:23.498 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:59:23.498 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:59:23.498 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:59:23.498 |     constructor: [Function: GQLError],
2025-09-29 12:59:23.498 |     cause: undefined,
2025-09-29 12:59:23.498 |     gqlStatus: '22N01',
2025-09-29 12:59:23.498 |     gqlStatusDescription: "error: data exception - invalid type. Expected the value Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.",
2025-09-29 12:59:23.498 |     diagnosticRecord: {
2025-09-29 12:59:23.498 |       OPERATION: '',
2025-09-29 12:59:23.498 |       OPERATION_CODE: '0',
2025-09-29 12:59:23.498 |       CURRENT_SCHEMA: '/',
2025-09-29 12:59:23.498 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:59:23.498 |     },
2025-09-29 12:59:23.498 |     classification: 'CLIENT_ERROR',
2025-09-29 12:59:23.498 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:59:23.498 |   }
2025-09-29 12:59:23.498 | }
2025-09-29 12:59:23.498 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')}.
2025-09-29 12:59:23.498 | 
2025-09-29 12:59:23.498 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:59:23.498 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:59:23.498 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:59:23.498 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:59:23.498 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:59:23.498 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:59:23.498 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:59:23.498 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:59:23.498 |     at async file:///app/dist/unified-neural-mcp-server.js:833:42
2025-09-29 12:59:23.498 |     at async Promise.all (index 0) {
2025-09-29 12:59:23.498 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:59:23.498 |   gqlStatus: '22G03',
2025-09-29 12:59:23.498 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:59:23.498 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:59:23.498 |   classification: 'UNKNOWN',
2025-09-29 12:59:23.498 |   rawClassification: undefined,
2025-09-29 12:59:23.498 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:59:23.498 |   retriable: false,
2025-09-29 12:59:23.498 |   [cause]: GQLError: 22N01: Expected the value Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:59:23.498 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:59:23.498 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:59:23.498 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:59:23.498 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:59:23.498 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:59:23.498 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:59:23.498 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:59:23.498 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:59:23.498 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:59:23.498 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:59:23.498 |     constructor: [Function: GQLError],
2025-09-29 12:59:23.498 |     cause: undefined,
2025-09-29 12:59:23.498 |     gqlStatus: '22N01',
2025-09-29 12:59:23.498 |     gqlStatusDescription: "error: data exception - invalid type. Expected the value Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.",
2025-09-29 12:59:23.498 |     diagnosticRecord: {
2025-09-29 12:59:23.498 |       OPERATION: '',
2025-09-29 12:59:23.498 |       OPERATION_CODE: '0',
2025-09-29 12:59:23.498 |       CURRENT_SCHEMA: '/',
2025-09-29 12:59:23.498 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:59:23.498 |     },
2025-09-29 12:59:23.498 |     classification: 'CLIENT_ERROR',
2025-09-29 12:59:23.498 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:59:23.498 |   }
2025-09-29 12:59:23.498 | }
2025-09-29 12:59:23.510 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')}.
2025-09-29 12:59:23.510 | 
2025-09-29 12:59:23.510 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:59:23.510 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:59:23.510 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:59:23.510 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:59:23.510 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:59:23.510 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:59:23.510 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:59:23.510 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:59:23.510 |     at async file:///app/dist/unified-neural-mcp-server.js:833:42
2025-09-29 12:59:23.510 |     at async Promise.all (index 1) {
2025-09-29 12:59:23.510 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:59:23.510 |   gqlStatus: '22G03',
2025-09-29 12:59:23.510 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:59:23.510 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:59:23.510 |   classification: 'UNKNOWN',
2025-09-29 12:59:23.510 |   rawClassification: undefined,
2025-09-29 12:59:23.510 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:59:23.510 |   retriable: false,
2025-09-29 12:59:23.510 |   [cause]: GQLError: 22N01: Expected the value Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:59:23.510 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:59:23.510 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:59:23.510 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:59:23.510 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:59:23.510 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:59:23.510 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:59:23.510 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:59:23.510 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:59:23.510 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:59:23.510 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:59:23.510 |     constructor: [Function: GQLError],
2025-09-29 12:59:23.510 |     cause: undefined,
2025-09-29 12:59:23.510 |     gqlStatus: '22N01',
2025-09-29 12:59:23.510 |     gqlStatusDescription: "error: data exception - invalid type. Expected the value Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.",
2025-09-29 12:59:23.510 |     diagnosticRecord: {
2025-09-29 12:59:23.510 |       OPERATION: '',
2025-09-29 12:59:23.510 |       OPERATION_CODE: '0',
2025-09-29 12:59:23.510 |       CURRENT_SCHEMA: '/',
2025-09-29 12:59:23.510 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:59:23.510 |     },
2025-09-29 12:59:23.510 |     classification: 'CLIENT_ERROR',
2025-09-29 12:59:23.510 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:59:23.510 |   }
2025-09-29 12:59:23.510 | }
2025-09-29 12:59:23.510 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')}.
2025-09-29 12:59:23.510 | 
2025-09-29 12:59:23.511 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:59:23.511 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:59:23.511 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:59:23.511 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:59:23.511 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:59:23.511 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:59:23.511 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:59:23.511 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:59:23.511 |     at async file:///app/dist/unified-neural-mcp-server.js:833:42
2025-09-29 12:59:23.511 |     at async Promise.all (index 1) {
2025-09-29 12:59:23.511 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:59:23.511 |   gqlStatus: '22G03',
2025-09-29 12:59:23.511 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:59:23.511 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:59:23.511 |   classification: 'UNKNOWN',
2025-09-29 12:59:23.511 |   rawClassification: undefined,
2025-09-29 12:59:23.511 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:59:23.511 |   retriable: false,
2025-09-29 12:59:23.511 |   [cause]: GQLError: 22N01: Expected the value Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:59:23.511 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:59:23.511 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:59:23.511 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:59:23.511 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:59:23.511 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:59:23.511 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:59:23.511 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:59:23.511 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:59:23.511 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:59:23.511 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:59:23.511 |     constructor: [Function: GQLError],
2025-09-29 12:59:23.511 |     cause: undefined,
2025-09-29 12:59:23.511 |     gqlStatus: '22N01',
2025-09-29 12:59:23.511 |     gqlStatusDescription: "error: data exception - invalid type. Expected the value Map{cacheEnabled -> Boolean('true'), vectorEmbedded -> Boolean('true'), graphIndexed -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.",
2025-09-29 12:59:23.511 |     diagnosticRecord: {
2025-09-29 12:59:23.511 |       OPERATION: '',
2025-09-29 12:59:23.511 |       OPERATION_CODE: '0',
2025-09-29 12:59:23.511 |       CURRENT_SCHEMA: '/',
2025-09-29 12:59:23.511 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:59:23.511 |     },
2025-09-29 12:59:23.511 |     classification: 'CLIENT_ERROR',
2025-09-29 12:59:23.511 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:59:23.511 |   }
2025-09-29 12:59:23.511 | }
2025-09-29 12:59:59.453 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{relationshipsUpdated -> Boolean('true'), vectorEmbedded -> Boolean('true')}.
2025-09-29 12:59:59.453 | 
2025-09-29 12:59:59.453 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:59:59.453 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:59:59.453 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:59:59.453 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:59:59.453 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:59:59.453 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:59:59.453 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:59:59.453 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:59:59.453 |     at async file:///app/dist/unified-neural-mcp-server.js:955:47
2025-09-29 12:59:59.453 |     at async Promise.all (index 0) {
2025-09-29 12:59:59.453 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:59:59.453 |   gqlStatus: '22G03',
2025-09-29 12:59:59.453 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:59:59.453 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:59:59.453 |   classification: 'UNKNOWN',
2025-09-29 12:59:59.453 |   rawClassification: undefined,
2025-09-29 12:59:59.453 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:59:59.453 |   retriable: false,
2025-09-29 12:59:59.453 |   [cause]: GQLError: 22N01: Expected the value Map{relationshipsUpdated -> Boolean('true'), vectorEmbedded -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:59:59.453 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:59:59.453 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:59:59.453 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:59:59.453 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:59:59.453 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:59:59.453 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:59:59.453 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:59:59.453 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:59:59.453 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:59:59.453 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:59:59.453 |     constructor: [Function: GQLError],
2025-09-29 12:59:59.453 |     cause: undefined,
2025-09-29 12:59:59.453 |     gqlStatus: '22N01',
2025-09-29 12:59:59.453 |     gqlStatusDescription: "error: data exception - invalid type. Expected the value Map{relationshipsUpdated -> Boolean('true'), vectorEmbedded -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.",
2025-09-29 12:59:59.453 |     diagnosticRecord: {
2025-09-29 12:59:59.453 |       OPERATION: '',
2025-09-29 12:59:59.453 |       OPERATION_CODE: '0',
2025-09-29 12:59:59.453 |       CURRENT_SCHEMA: '/',
2025-09-29 12:59:59.453 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:59:59.453 |     },
2025-09-29 12:59:59.453 |     classification: 'CLIENT_ERROR',
2025-09-29 12:59:59.453 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:59:59.453 |   }
2025-09-29 12:59:59.453 | }
2025-09-29 12:59:59.453 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{relationshipsUpdated -> Boolean('true'), vectorEmbedded -> Boolean('true')}.
2025-09-29 12:59:59.453 | 
2025-09-29 12:59:59.453 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 12:59:59.453 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 12:59:59.453 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 12:59:59.453 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 12:59:59.453 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 12:59:59.453 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 12:59:59.453 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 12:59:59.453 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 12:59:59.453 |     at async file:///app/dist/unified-neural-mcp-server.js:955:47
2025-09-29 12:59:59.453 |     at async Promise.all (index 0) {
2025-09-29 12:59:59.453 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 12:59:59.453 |   gqlStatus: '22G03',
2025-09-29 12:59:59.453 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 12:59:59.453 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 12:59:59.453 |   classification: 'UNKNOWN',
2025-09-29 12:59:59.453 |   rawClassification: undefined,
2025-09-29 12:59:59.453 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 12:59:59.453 |   retriable: false,
2025-09-29 12:59:59.453 |   [cause]: GQLError: 22N01: Expected the value Map{relationshipsUpdated -> Boolean('true'), vectorEmbedded -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 12:59:59.453 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 12:59:59.453 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 12:59:59.453 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 12:59:59.453 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 12:59:59.453 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 12:59:59.453 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 12:59:59.453 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 12:59:59.453 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 12:59:59.453 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 12:59:59.453 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 12:59:59.453 |     constructor: [Function: GQLError],
2025-09-29 12:59:59.453 |     cause: undefined,
2025-09-29 12:59:59.453 |     gqlStatus: '22N01',
2025-09-29 12:59:59.453 |     gqlStatusDescription: "error: data exception - invalid type. Expected the value Map{relationshipsUpdated -> Boolean('true'), vectorEmbedded -> Boolean('true')} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.",
2025-09-29 12:59:59.453 |     diagnosticRecord: {
2025-09-29 12:59:59.453 |       OPERATION: '',
2025-09-29 12:59:59.453 |       OPERATION_CODE: '0',
2025-09-29 12:59:59.453 |       CURRENT_SCHEMA: '/',
2025-09-29 12:59:59.453 |       _classification: 'CLIENT_ERROR'
2025-09-29 12:59:59.453 |     },
2025-09-29 12:59:59.453 |     classification: 'CLIENT_ERROR',
2025-09-29 12:59:59.453 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 12:59:59.453 |   }
2025-09-29 12:59:59.453 | }
2025-09-29 12:59:23.511 | ✅ Unified Neural MCP request processed
2025-09-29 12:59:59.385 | 🔗 Unified Neural MCP Request received: {
2025-09-29 12:59:59.385 |   id: 13,
2025-09-29 12:59:59.385 |   jsonrpc: '2.0',
2025-09-29 12:59:59.385 |   method: 'tools/call',
2025-09-29 12:59:59.385 |   params: { arguments: { observations: [Array] }, name: 'add_observations' }
2025-09-29 12:59:59.385 | }
2025-09-29 12:59:59.402 | 💾 Memory stored in Weaviate: 78337cc3-06ac-4b4f-899a-db8f1528ca18
2025-09-29 12:59:59.453 | 💾 Stored shared memory (observation) for agent unified-neural-mcp-server [Multi-DB]
2025-09-29 12:59:59.453 | 🧠 Advanced Memory: update operation for Philly Wings Common Memory
2025-09-29 12:59:59.453 | ✅ Unified Neural MCP request processed
2025-09-29 13:00:10.436 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:00:10.436 |   id: 14,
2025-09-29 13:00:10.436 |   jsonrpc: '2.0',
2025-09-29 13:00:10.436 |   method: 'tools/call',
2025-09-29 13:00:10.436 |   params: {
2025-09-29 13:00:10.436 |     arguments: {
2025-09-29 13:00:10.436 |       to: 'claude',
2025-09-29 13:00:10.436 |       from: 'codex-cli',
2025-09-29 13:00:10.436 |       messageType: 'status',
2025-09-29 13:00:10.436 |       priority: 'normal',
2025-09-29 13:00:10.436 |       content: 'Update: I reviewed 2025-09-27 memory docs and current codebase, then published a detailed shared brief to neural common memory under entity “Philly Wings Common Memory.” It captures architecture, key files, DoorDash wings flow status, known issues, and Phase 2 next steps. Happy to iterate or split tasks.'
2025-09-29 13:00:10.436 |     },
2025-09-29 13:00:10.436 |     name: 'send_ai_message'
2025-09-29 13:00:10.436 |   }
2025-09-29 13:00:10.436 | }
2025-09-29 13:00:10.444 | 💾 Stored shared memory (ai_message) for agent codex-cli [Multi-DB]
2025-09-29 13:00:10.444 | ⚡ Real-time delivery: codex-cli → claude
2025-09-29 13:00:10.444 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:00:10.444 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:00:10.444 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:00:10.445 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:00:10.445 | 📨 Agent claude notified of message from codex-cli
2025-09-29 13:00:10.445 | ✅ Message delivered to claude
2025-09-29 13:00:10.450 | 🔄 Updated shared memory: 8ec0fe8c-3b33-4ddb-a143-9805e4c3cc4d
2025-09-29 13:00:10.450 | 💾 Updated delivery status to 'delivered' for message 8ec0fe8c-3b33-4ddb-a143-9805e4c3cc4d
2025-09-29 13:00:10.450 | ✅ Unified Neural MCP request processed
2025-09-29 13:01:31.121 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:01:31.121 |   method: 'tools/call',
2025-09-29 13:01:31.121 |   params: {
2025-09-29 13:01:31.121 |     name: 'get_ai_messages',
2025-09-29 13:01:31.121 |     arguments: { agentId: 'claude-code' },
2025-09-29 13:01:31.121 |     _meta: { 'claudecode/toolUseId': 'toolu_01AqQe6X6T3E1DpmULNXDVfh' }
2025-09-29 13:01:31.121 |   },
2025-09-29 13:01:31.121 |   jsonrpc: '2.0',
2025-09-29 13:01:31.121 |   id: 5
2025-09-29 13:01:31.121 | }
2025-09-29 13:01:31.122 | 🔍 Performing semantic search with Weaviate: ""to":"claude-code""
2025-09-29 13:01:31.161 | 🕸️ Performing relationship search with Neo4j: ""to":"claude-code""
2025-09-29 13:01:31.179 | 🔍 Cached search results for: ""to":"claude-code"" (10 results)
2025-09-29 13:01:31.179 | ✅ Unified Neural MCP request processed
2025-09-29 13:01:36.700 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:01:36.700 |   method: 'tools/call',
2025-09-29 13:01:36.700 |   params: {
2025-09-29 13:01:36.700 |     name: 'get_agent_status',
2025-09-29 13:01:36.700 |     arguments: {},
2025-09-29 13:01:36.700 |     _meta: { 'claudecode/toolUseId': 'toolu_01JuiSRPwGS9bY7jJ5QCWBEa' }
2025-09-29 13:01:36.700 |   },
2025-09-29 13:01:36.700 |   jsonrpc: '2.0',
2025-09-29 13:01:36.700 |   id: 6
2025-09-29 13:01:36.700 | }
2025-09-29 13:01:36.702 | 🔍 Performing semantic search with Weaviate: "agent_registration"
2025-09-29 13:01:36.742 | 🕸️ Performing relationship search with Neo4j: "agent_registration"
2025-09-29 13:01:36.755 | 🔍 Cached search results for: "agent_registration" (3 results)
2025-09-29 13:01:36.756 | ✅ Unified Neural MCP request processed
2025-09-29 13:02:37.753 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:02:37.753 |   id: 15,
2025-09-29 13:02:37.753 |   jsonrpc: '2.0',
2025-09-29 13:02:37.753 |   method: 'tools/call',
2025-09-29 13:02:37.753 |   params: { arguments: { agentId: 'codex-cli' }, name: 'get_agent_status' }
2025-09-29 13:02:37.753 | }
2025-09-29 13:02:37.754 | 🔍 Performing semantic search with Weaviate: ""agentId":"codex-cli""
2025-09-29 13:02:37.786 | 🕸️ Performing relationship search with Neo4j: ""agentId":"codex-cli""
2025-09-29 13:02:37.802 | 🔍 Cached search results for: ""agentId":"codex-cli"" (6 results)
2025-09-29 13:02:37.802 | ✅ Unified Neural MCP request processed
2025-09-29 13:02:41.196 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:02:41.196 |   id: 16,
2025-09-29 13:02:41.196 |   jsonrpc: '2.0',
2025-09-29 13:02:41.196 |   method: 'tools/call',
2025-09-29 13:02:41.196 |   params: { arguments: { agentId: 'claude-code' }, name: 'get_agent_status' }
2025-09-29 13:02:41.196 | }
2025-09-29 13:02:41.197 | 🔍 Performing semantic search with Weaviate: ""agentId":"claude-code""
2025-09-29 13:02:41.225 | 🕸️ Performing relationship search with Neo4j: ""agentId":"claude-code""
2025-09-29 13:02:41.247 | 🔍 Cached search results for: ""agentId":"claude-code"" (3 results)
2025-09-29 13:02:41.247 | ✅ Unified Neural MCP request processed
2025-09-29 13:02:51.899 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:02:51.900 |   id: 17,
2025-09-29 13:02:51.900 |   jsonrpc: '2.0',
2025-09-29 13:02:51.900 |   method: 'tools/call',
2025-09-29 13:02:51.900 |   params: {
2025-09-29 13:02:51.900 |     arguments: {
2025-09-29 13:02:51.900 |       to: 'claude-code',
2025-09-29 13:02:51.900 |       from: 'codex-cli',
2025-09-29 13:02:51.900 |       messageType: 'status',
2025-09-29 13:02:51.900 |       priority: 'normal',
2025-09-29 13:02:51.900 |       content: 'Hi Claude — this is codex-cli. I reviewed the 2025-09-27 memory docs and the repo, synthesized a detailed shared brief, and saved it to neural common memory under the entity “Philly Wings Common Memory.” It covers architecture, key files, DoorDash wings flow state, known issues, and Phase 2 next steps. Let me know if you want me to split tasks or start implementing the orchestrators next.'
2025-09-29 13:02:51.900 |     },
2025-09-29 13:02:51.900 |     name: 'send_ai_message'
2025-09-29 13:02:51.900 |   }
2025-09-29 13:02:51.900 | }
2025-09-29 13:02:51.909 | 💾 Stored shared memory (ai_message) for agent codex-cli [Multi-DB]
2025-09-29 13:02:51.910 | ⚡ Real-time delivery: codex-cli → claude-code
2025-09-29 13:02:51.910 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:02:51.910 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:02:51.910 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:02:51.910 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:02:51.910 | 📨 Agent claude-code notified of message from codex-cli
2025-09-29 13:02:51.910 | ✅ Message delivered to claude-code
2025-09-29 13:02:51.913 | 🔄 Updated shared memory: 749a8c38-2348-4a84-8f7b-53aff77ded48
2025-09-29 13:02:51.914 | 💾 Updated delivery status to 'delivered' for message 749a8c38-2348-4a84-8f7b-53aff77ded48
2025-09-29 13:02:51.914 | ✅ Unified Neural MCP request processed
2025-09-29 13:03:02.686 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:03:02.686 |   id: 18,
2025-09-29 13:03:02.686 |   jsonrpc: '2.0',
2025-09-29 13:03:02.686 |   method: 'tools/call',
2025-09-29 13:03:02.686 |   params: {
2025-09-29 13:03:02.686 |     arguments: {
2025-09-29 13:03:02.686 |       agentId: 'claude-code',
2025-09-29 13:03:02.686 |       limit: 5,
2025-09-29 13:03:02.686 |       since: '2025-09-29T17:58:00.000Z'
2025-09-29 13:03:02.686 |     },
2025-09-29 13:03:02.686 |     name: 'get_ai_messages'
2025-09-29 13:03:02.686 |   }
2025-09-29 13:03:02.686 | }
2025-09-29 13:03:02.687 | ⚡ Retrieved cached search results for: ""to":"claude-code"" (10 results)
2025-09-29 13:03:02.687 | ⚡ Returning cached search results for: ""to":"claude-code""
2025-09-29 13:03:02.687 | ✅ Unified Neural MCP request processed
2025-09-29 13:03:13.394 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:03:13.394 |   id: 19,
2025-09-29 13:03:13.394 |   jsonrpc: '2.0',
2025-09-29 13:03:13.394 |   method: 'tools/call',
2025-09-29 13:03:13.394 |   params: {
2025-09-29 13:03:13.394 |     arguments: {
2025-09-29 13:03:13.394 |       broadcast: true,
2025-09-29 13:03:13.394 |       content: 'Heads up: codex-cli published the detailed Philly Wings Common Memory brief in neural. Claude-code, see entity “Philly Wings Common Memory” for architecture/state/next steps. Ready to coordinate Phase 2 tasks.',
2025-09-29 13:03:13.394 |       from: 'codex-cli',
2025-09-29 13:03:13.394 |       messageType: 'status',
2025-09-29 13:03:13.394 |       priority: 'normal',
2025-09-29 13:03:13.394 |       to: '*'
2025-09-29 13:03:13.394 |     },
2025-09-29 13:03:13.394 |     name: 'send_ai_message'
2025-09-29 13:03:13.394 |   }
2025-09-29 13:03:13.394 | }
2025-09-29 13:03:13.394 | ⚡ Retrieved cached search results for: "agent_registration" (3 results)
2025-09-29 13:03:13.394 | ⚡ Returning cached search results for: "agent_registration"
2025-09-29 13:03:13.400 | 💾 Stored shared memory (ai_message) for agent codex-cli [Multi-DB]
2025-09-29 13:03:13.400 | ⚡ Real-time delivery: codex-cli → cursor-agent
2025-09-29 13:03:13.401 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:03:13.401 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:03:13.401 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:03:13.401 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:03:13.401 | 📨 Agent cursor-agent notified of message from codex-cli
2025-09-29 13:03:13.401 | ✅ Message delivered to cursor-agent
2025-09-29 13:03:13.404 | 🔄 Updated shared memory: 1416a272-2325-451c-8d7d-bc5ec3d3fb7c
2025-09-29 13:03:13.404 | 💾 Updated delivery status to 'delivered' for message 1416a272-2325-451c-8d7d-bc5ec3d3fb7c
2025-09-29 13:03:13.410 | 💾 Stored shared memory (ai_message) for agent codex-cli [Multi-DB]
2025-09-29 13:03:13.410 | ⚡ Real-time delivery: codex-cli → agent-ErikaDesktop-46762-mg5f6u03
2025-09-29 13:03:13.410 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:03:13.410 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:03:13.410 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:03:13.410 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:03:13.410 | 📨 Agent agent-ErikaDesktop-46762-mg5f6u03 notified of message from codex-cli
2025-09-29 13:03:13.410 | ✅ Message delivered to agent-ErikaDesktop-46762-mg5f6u03
2025-09-29 13:03:13.417 | 🔄 Updated shared memory: 4ffca197-0f84-4048-8e03-9ad0910d15e8
2025-09-29 13:03:13.417 | 💾 Updated delivery status to 'delivered' for message 4ffca197-0f84-4048-8e03-9ad0910d15e8
2025-09-29 13:03:13.419 | 💾 Stored shared memory (ai_message) for agent codex-cli [Multi-DB]
2025-09-29 13:03:13.419 | ⚡ Real-time delivery: codex-cli → agent-ErikaDesktop-47631-mg5f78d5
2025-09-29 13:03:13.419 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:03:13.419 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:03:13.419 | 📡 Event broadcast: message.new → 0 clients
2025-09-29 13:03:13.419 | 📊 Hub Event: message.new → 0 clients notified
2025-09-29 13:03:13.419 | 📨 Agent agent-ErikaDesktop-47631-mg5f78d5 notified of message from codex-cli
2025-09-29 13:03:13.419 | ✅ Message delivered to agent-ErikaDesktop-47631-mg5f78d5
2025-09-29 13:03:13.428 | 🔄 Updated shared memory: 9618d2bf-68e4-44d0-95d1-1fb471add54b
2025-09-29 13:03:13.428 | 💾 Updated delivery status to 'delivered' for message 9618d2bf-68e4-44d0-95d1-1fb471add54b
2025-09-29 13:03:13.428 | ✅ Unified Neural MCP request processed
2025-09-29 13:03:54.275 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:03:54.275 |   method: 'tools/call',
2025-09-29 13:03:54.275 |   params: {
2025-09-29 13:03:54.275 |     name: 'get_ai_messages',
2025-09-29 13:03:54.275 |     arguments: { agentId: 'claude-code' },
2025-09-29 13:03:54.275 |     _meta: { 'claudecode/toolUseId': 'toolu_015UYxKrK9sZXzpfHiR9nqzk' }
2025-09-29 13:03:54.275 |   },
2025-09-29 13:03:54.275 |   jsonrpc: '2.0',
2025-09-29 13:03:54.275 |   id: 7
2025-09-29 13:03:54.275 | }
2025-09-29 13:03:54.276 | ⚡ Retrieved cached search results for: ""to":"claude-code"" (10 results)
2025-09-29 13:03:54.276 | ⚡ Returning cached search results for: ""to":"claude-code""
2025-09-29 13:03:54.276 | ✅ Unified Neural MCP request processed
2025-09-29 13:04:01.468 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:04:01.468 |   method: 'tools/call',
2025-09-29 13:04:01.468 |   params: {
2025-09-29 13:04:01.468 |     name: 'get_agent_status',
2025-09-29 13:04:01.468 |     arguments: {},
2025-09-29 13:04:01.468 |     _meta: { 'claudecode/toolUseId': 'toolu_011NLzdq6bgCwFCTaXdVNV9g' }
2025-09-29 13:04:01.468 |   },
2025-09-29 13:04:01.468 |   jsonrpc: '2.0',
2025-09-29 13:04:01.468 |   id: 8
2025-09-29 13:04:01.468 | }
2025-09-29 13:04:01.469 | ⚡ Retrieved cached search results for: "agent_registration" (3 results)
2025-09-29 13:04:01.469 | ⚡ Returning cached search results for: "agent_registration"
2025-09-29 13:04:01.469 | ✅ Unified Neural MCP request processed
2025-09-29 13:04:11.360 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:04:11.360 |   method: 'tools/call',
2025-09-29 13:04:11.360 |   params: {
2025-09-29 13:04:11.360 |     name: 'register_agent',
2025-09-29 13:04:11.360 |     arguments: {
2025-09-29 13:04:11.360 |       agentId: 'claude-code',
2025-09-29 13:04:11.360 |       name: 'Claude Code',
2025-09-29 13:04:11.360 |       capabilities: [Array],
2025-09-29 13:04:11.360 |       metadata: [Object]
2025-09-29 13:04:11.360 |     },
2025-09-29 13:04:11.360 |     _meta: { 'claudecode/toolUseId': 'toolu_01DvmJiNfhh5oqstURFXLUJK' }
2025-09-29 13:04:11.360 |   },
2025-09-29 13:04:11.360 |   jsonrpc: '2.0',
2025-09-29 13:04:11.360 |   id: 9
2025-09-29 13:04:11.360 | }
2025-09-29 13:04:11.377 | 💾 Memory stored in Weaviate: adddbc55-4f64-47f7-a471-03bed2680301
2025-09-29 13:04:11.388 | ❌ Error storing memory in Neo4j: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T18:04:11.360Z"), environment -> String("development"), registeredBy -> String("claude-code"), session -> String("active"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")}.
2025-09-29 13:04:11.388 | 
2025-09-29 13:04:11.388 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 13:04:11.388 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 13:04:11.388 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 13:04:11.388 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 13:04:11.388 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 13:04:11.388 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 13:04:11.388 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 13:04:11.388 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 13:04:11.388 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 13:04:11.388 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 13:04:11.388 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 13:04:11.388 |   gqlStatus: '22G03',
2025-09-29 13:04:11.388 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 13:04:11.388 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 13:04:11.388 |   classification: 'UNKNOWN',
2025-09-29 13:04:11.388 |   rawClassification: undefined,
2025-09-29 13:04:11.388 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 13:04:11.388 |   retriable: false,
2025-09-29 13:04:11.388 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T18:04:11.360Z"), environment -> String("development"), registeredBy -> String("claude-code"), session -> String("active"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 13:04:11.388 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 13:04:11.388 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 13:04:11.388 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 13:04:11.388 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 13:04:11.388 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 13:04:11.388 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 13:04:11.388 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 13:04:11.388 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 13:04:11.388 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 13:04:11.388 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 13:04:11.388 |     constructor: [Function: GQLError],
2025-09-29 13:04:11.388 |     cause: undefined,
2025-09-29 13:04:11.388 |     gqlStatus: '22N01',
2025-09-29 13:04:11.388 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T18:04:11.360Z"), environment -> String("development"), registeredBy -> String("claude-code"), session -> String("active"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 13:04:11.388 |     diagnosticRecord: {
2025-09-29 13:04:11.388 |       OPERATION: '',
2025-09-29 13:04:11.388 |       OPERATION_CODE: '0',
2025-09-29 13:04:11.388 |       CURRENT_SCHEMA: '/',
2025-09-29 13:04:11.388 |       _classification: 'CLIENT_ERROR'
2025-09-29 13:04:11.388 |     },
2025-09-29 13:04:11.388 |     classification: 'CLIENT_ERROR',
2025-09-29 13:04:11.388 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 13:04:11.388 |   }
2025-09-29 13:04:11.388 | }
2025-09-29 13:04:11.388 | ⚠️ Failed to store in advanced systems: Neo4jError: Property values can only be of primitive types or arrays thereof. Encountered: Map{registrationTime -> String("2025-09-29T18:04:11.360Z"), environment -> String("development"), registeredBy -> String("claude-code"), session -> String("active"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")}.
2025-09-29 13:04:11.388 | 
2025-09-29 13:04:11.388 |     at captureStacktrace (/app/node_modules/neo4j-driver-core/lib/result.js:624:17)
2025-09-29 13:04:11.388 |     at new Result (/app/node_modules/neo4j-driver-core/lib/result.js:112:23)
2025-09-29 13:04:11.388 |     at Session._run (/app/node_modules/neo4j-driver-core/lib/session.js:224:16)
2025-09-29 13:04:11.388 |     at Session.run (/app/node_modules/neo4j-driver-core/lib/session.js:188:27)
2025-09-29 13:04:11.388 |     at Neo4jMemoryClient.storeMemory (file:///app/dist/memory/neo4j-client.js:40:27)
2025-09-29 13:04:11.388 |     at MemoryManager.storeInAdvancedSystems (file:///app/dist/unified-server/memory/index.js:435:40)
2025-09-29 13:04:11.388 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
2025-09-29 13:04:11.388 |     at async MemoryManager.store (file:///app/dist/unified-server/memory/index.js:412:13)
2025-09-29 13:04:11.388 |     at async UnifiedNeuralMCPServer._handleToolCall (file:///app/dist/unified-neural-mcp-server.js:1248:44)
2025-09-29 13:04:11.388 |     at async file:///app/dist/unified-neural-mcp-server.js:158:34 {
2025-09-29 13:04:11.388 |   constructor: [Function: Neo4jError] { isRetriable: [Function (anonymous)] },
2025-09-29 13:04:11.388 |   gqlStatus: '22G03',
2025-09-29 13:04:11.388 |   gqlStatusDescription: 'error: data exception - invalid value type',
2025-09-29 13:04:11.388 |   diagnosticRecord: { OPERATION: '', OPERATION_CODE: '0', CURRENT_SCHEMA: '/' },
2025-09-29 13:04:11.388 |   classification: 'UNKNOWN',
2025-09-29 13:04:11.388 |   rawClassification: undefined,
2025-09-29 13:04:11.388 |   code: 'Neo.ClientError.Statement.TypeError',
2025-09-29 13:04:11.388 |   retriable: false,
2025-09-29 13:04:11.388 |   [cause]: GQLError: 22N01: Expected the value Map{registrationTime -> String("2025-09-29T18:04:11.360Z"), environment -> String("development"), registeredBy -> String("claude-code"), session -> String("active"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.
2025-09-29 13:04:11.388 |       at new GQLError (/app/node_modules/neo4j-driver-core/lib/error.js:117:24)
2025-09-29 13:04:11.388 |       at newGQLError (/app/node_modules/neo4j-driver-core/lib/error.js:261:12)
2025-09-29 13:04:11.388 |       at ResponseHandler._handleErrorCause (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:199:57)
2025-09-29 13:04:11.388 |       at ResponseHandler._handleErrorPayload (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:193:50)
2025-09-29 13:04:11.388 |       at ResponseHandler.handleResponse (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/response-handler.js:116:49)
2025-09-29 13:04:11.388 |       at dechunker.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:74:33)
2025-09-29 13:04:11.388 |       at Dechunker._onHeader (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:196:18)
2025-09-29 13:04:11.388 |       at Dechunker.AWAITING_CHUNK (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:149:25)
2025-09-29 13:04:11.388 |       at Dechunker.write (/app/node_modules/neo4j-driver-bolt-connection/lib/channel/chunking.js:206:32)
2025-09-29 13:04:11.388 |       at channel.onmessage (/app/node_modules/neo4j-driver-bolt-connection/lib/bolt/create.js:70:63) {
2025-09-29 13:04:11.388 |     constructor: [Function: GQLError],
2025-09-29 13:04:11.388 |     cause: undefined,
2025-09-29 13:04:11.388 |     gqlStatus: '22N01',
2025-09-29 13:04:11.388 |     gqlStatusDescription: 'error: data exception - invalid type. Expected the value Map{registrationTime -> String("2025-09-29T18:04:11.360Z"), environment -> String("development"), registeredBy -> String("claude-code"), session -> String("active"), project -> String("philly-wings"), version -> String("1.0.0"), platform -> String("claude-code"), status -> String("active")} to be of type BOOLEAN, STRING, INTEGER, FLOAT, DATE, LOCAL TIME, ZONED TIME, LOCAL DATETIME, ZONED DATETIME, DURATION, POINT, NODE or RELATIONSHIP, but was of type MAP NOT NULL.',
2025-09-29 13:04:11.388 |     diagnosticRecord: {
2025-09-29 13:04:11.388 |       OPERATION: '',
2025-09-29 13:04:11.388 |       OPERATION_CODE: '0',
2025-09-29 13:04:11.388 |       CURRENT_SCHEMA: '/',
2025-09-29 13:04:11.388 |       _classification: 'CLIENT_ERROR'
2025-09-29 13:04:11.388 |     },
2025-09-29 13:04:11.388 |     classification: 'CLIENT_ERROR',
2025-09-29 13:04:11.388 |     rawClassification: 'CLIENT_ERROR'
2025-09-29 13:04:11.388 |   }
2025-09-29 13:04:11.388 | }
2025-09-29 13:04:11.388 | 💾 Stored shared memory (agent_registration) for agent claude-code [Multi-DB]
2025-09-29 13:04:11.389 | 🤖 Agent registered: claude-code (Claude Code)
2025-09-29 13:04:11.389 | ✅ Unified Neural MCP request processed
2025-09-29 13:04:16.270 | 🔗 Unified Neural MCP Request received: {
2025-09-29 13:04:16.270 |   method: 'tools/call',
2025-09-29 13:04:16.270 |   params: {
2025-09-29 13:04:16.270 |     name: 'get_ai_messages',
2025-09-29 13:04:16.270 |     arguments: { agentId: 'claude-code' },
2025-09-29 13:04:16.270 |     _meta: { 'claudecode/toolUseId': 'toolu_01MvN5W228kucBhmzsFmen2R' }
2025-09-29 13:04:16.270 |   },
2025-09-29 13:04:16.270 |   jsonrpc: '2.0',
2025-09-29 13:04:16.270 |   id: 10
2025-09-29 13:04:16.270 | }
2025-09-29 13:04:16.271 | ⚡ Retrieved cached search results for: ""to":"claude-code"" (10 results)
2025-09-29 13:04:16.271 | ⚡ Returning cached search results for: ""to":"claude-code""
2025-09-29 13:04:16.271 | ✅ Unified Neural MCP request processed