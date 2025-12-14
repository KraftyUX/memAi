# memAI Documentation

## Quick Links

- [Vision](VISION.md) - Project purpose and principles
- [API Reference](API.md) - Complete API documentation
- [CLI Reference](CLI.md) - Command-line interface
- [Examples](EXAMPLES.md) - Usage examples

## Getting Started

```bash
# Install
npm install memai

# Initialize
npx memai init

# Launch dashboard
npx memai dashboard
```

## For Developers

### API Usage

```javascript
import Memai from 'memai';

const memai = new Memai();

memai.record({
  category: 'implementation',
  action: 'What you did',
  outcome: 'What happened'
});

memai.close();
```

### MCP Integration

Add to your MCP config:

```json
{
  "mcpServers": {
    "memai": {
      "command": "node",
      "args": ["/path/to/memai/dist/src/mcp-server.js"],
      "env": {
        "MEMAI_DB_PATH": "/path/to/.memai/memory.db"
      }
    }
  }
}
```

### AI Agent Steering

Include `memai.md` in your project root. It provides guidelines for when and how agents should record memories.

## Documentation Structure

```
docs/
├── README.md      # This file
├── VISION.md      # Project vision and principles
├── API.md         # API reference
├── CLI.md         # CLI reference
└── EXAMPLES.md    # Usage examples
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## Support

- [GitHub Issues](https://github.com/kraftyux/memai/issues) - Bug reports
- [GitHub Discussions](https://github.com/kraftyux/memai/discussions) - Questions
