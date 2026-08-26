# mcp-unesco-uis

UNESCO Institute for Statistics (UIS) MCP — keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/unesco-uis/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Unesco Uis data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
