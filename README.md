# SeeClickFix MCP Server

A Model Context Protocol (MCP) server that provides access to real-time civic issue reports from SeeClickFix's Open311 API. This tool allows you to retrieve information about local infrastructure problems, service requests, and community-reported issues by geographic location.

## Features

- **Real-time Civic Data**: Access current civic issues and service requests
- **Location-based Search**: Find issues near specific geographic coordinates
- **Open311 API Integration**: Built on the standardized Open311 protocol
- **MCP Compatible**: Works with any MCP-compatible client

## Installation

1. Clone the repository:
```bash
git clone https://github.com/chrisjamesbond/seeclickfix-mcp-server
cd mcp-see-click-fix
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
npm run bundle
```

## Usage

### As an MCP Server

The server provides one tool:

#### `get_requests`
Get civic issue requests near a geographic location.

**Parameters:**
- `latitude` (string): Latitude coordinate of the point of interest
- `longitude` (string): Longitude coordinate of the point of interest

**Example:**
```json
{
  "name": "get_requests",
  "arguments": {
    "latitude": "42.3601",
    "longitude": "-71.0589"
  }
}
```

### Development

Run in development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm run bundle
```

### Packaging

Create a [https://www.anthropic.com/engineering/desktop-extensions](one-click MCP server installation for Claude Desktop):
```bash
npx @anthropic-ai/dxt pack
```

## API Information

This server uses the SeeClickFix Open311 API to retrieve civic issue data. The API provides information including:

- Issue descriptions
- Current status
- Address/location
- Service type
- Last update timestamp

## Configuration

The server is configured via the `manifest.json` file and includes:

- Server metadata and description
- Tool definitions
- Entry point configuration
- Keywords and licensing information

## Technical Details

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: MCP SDK
- **HTTP Client**: Axios
- **Build Tool**: esbuild

## License

MIT