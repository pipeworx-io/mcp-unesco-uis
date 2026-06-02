interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * UNESCO Institute for Statistics (UIS) MCP — keyless.
 *
 * Education, literacy, school enrollment, science (R&D) and culture indicators
 * for ~200 countries. Indicator IDs (e.g. "CR.1", "10") come from list_indicators;
 * geoUnit is an ISO3 country code (e.g. "BRA") from list_geounits. Keyless public API.
 */


const BASE = 'https://api.uis.unesco.org/api/public';
const UA = 'pipeworx-mcp-unesco-uis/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'get_data',
    description:
      'Fetch UNESCO UIS statistic values: education, literacy, school enrollment/completion, science (R&D) and culture indicators. Returns {records:[{indicatorId,geoUnit,year,value}]}. Indicator IDs come from list_indicators; geoUnit is an ISO3 country code (e.g. "BRA") from list_geounits. Both accept one or many (comma-separated) values; empty records means no data for that indicator/country/year combination.',
    inputSchema: {
      type: 'object',
      properties: {
        indicator: {
          type: 'string',
          description: 'Indicator ID(s) from list_indicators, e.g. "CR.1" or "10". Multiple comma-separated: "CR.1,CR.2".',
        },
        geoUnit: {
          type: 'string',
          description: 'ISO3 country/region code(s) from list_geounits, e.g. "BRA". Multiple comma-separated: "BRA,ARG".',
        },
        start: { type: 'number', description: 'First year (inclusive), e.g. 2015.' },
        end: { type: 'number', description: 'Last year (inclusive), e.g. 2020.' },
      },
      required: ['indicator', 'geoUnit'],
    },
  },
  {
    name: 'list_indicators',
    description:
      'Browse/search the UNESCO UIS indicator catalog (education, literacy, enrollment, science/R&D, culture). Filter by case-insensitive name substring. Each entry has indicatorCode (pass as `indicator` to get_data), name, theme and data availability (year range, record count).',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Case-insensitive substring matched against indicator name, e.g. "literacy".' },
        limit: { type: 'number', description: 'Max results to return (default 50).' },
      },
    },
  },
  {
    name: 'list_geounits',
    description:
      'List UNESCO UIS geographic units (countries/regions) with their ISO3 code (id), name and type. Use the id as `geoUnit` in get_data. Optional case-insensitive name substring filter.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Case-insensitive substring matched against country/region name, e.g. "brazil".' },
        limit: { type: 'number', description: 'Max results to return (default 300).' },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_data': {
      const indicator = reqStr(args, 'indicator', '"CR.1" or "CR.1,CR.2"');
      const geoUnit = reqStr(args, 'geoUnit', '"BRA" or "BRA,ARG"');
      const qs = new URLSearchParams();
      for (const id of splitList(indicator)) qs.append('indicator', id);
      for (const g of splitList(geoUnit)) qs.append('geoUnit', g);
      if (typeof args.start === 'number') qs.set('start', String(args.start));
      if (typeof args.end === 'number') qs.set('end', String(args.end));
      return uisGet(`/data/indicators?${qs.toString()}`);
    }
    case 'list_indicators': {
      const all = (await uisGet('/definitions/indicators')) as Array<Record<string, unknown>>;
      const search = (args.search as string | undefined)?.trim().toLowerCase();
      const limit = typeof args.limit === 'number' && args.limit > 0 ? args.limit : 50;
      const filtered = search
        ? all.filter((i) => String(i.name ?? '').toLowerCase().includes(search))
        : all;
      return { total: filtered.length, indicators: filtered.slice(0, limit) };
    }
    case 'list_geounits': {
      const all = (await uisGet('/definitions/geounits')) as Array<Record<string, unknown>>;
      const search = (args.search as string | undefined)?.trim().toLowerCase();
      const limit = typeof args.limit === 'number' && args.limit > 0 ? args.limit : 300;
      const filtered = search
        ? all.filter((g) => String(g.name ?? '').toLowerCase().includes(search))
        : all;
      return { total: filtered.length, geoUnits: filtered.slice(0, limit) };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function uisGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`UNESCO UIS: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function splitList(v: string): string[] {
  return v.split(',').map((s) => s.trim()).filter(Boolean);
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
