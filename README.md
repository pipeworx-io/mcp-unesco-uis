# mcp-unesco-uis

UNESCO Institute for Statistics (UIS) MCP — keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_data` | Fetch UNESCO UIS statistic values: education, literacy, school enrollment/completion, science (R&D) and culture indicators. Returns {records:[{indicatorId,geoUnit,year,value}]}. Indicator IDs come from list_indicators; geoUnit is an ISO3 country code (e.g. "BRA") from list_geounits. Both accept one or many (comma-separated) values; empty records means no data for that indicator/country/year combination. |
| `list_indicators` | Browse/search the UNESCO UIS indicator catalog (education, literacy, enrollment, science/R&D, culture). Filter by case-insensitive name substring. Each entry has indicatorCode (pass as `indicator` to get_data), name, theme and data availability (year range, record count). |
| `list_geounits` | List UNESCO UIS geographic units (countries/regions) with their ISO3 code (id), name and type. Use the id as `geoUnit` in get_data. Optional case-insensitive name substring filter. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "unesco-uis": {
      "url": "https://gateway.pipeworx.io/unesco-uis/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Unesco Uis data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
