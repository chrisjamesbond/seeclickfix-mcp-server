from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("SeeClickFix")

# Constants
SEECLICKFIX_API_BASE = "https://seeclickfix.com"
USER_AGENT = "civic-mcp/0.1"

async def make_see_click_fix_request(url: str) -> dict[str, Any] | None:
    """Make a request to the See Click Fix Open311 API."""
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None

def format_request(features: list) -> str:
    """Format a request into a readable string."""
    return f"""
        Description: {features.get('description', 'No description available')}
        Status: {features.get('status', 'No status provided')}
        Address: {features.get('address', 'No address provided')}
        Service: {features.get('service_name', 'No service provided')}
        Last Updated: {features.get('updated_datetime', 'No updates yet')}
        """

@mcp.tool()
async def get_requests(latitude: str, longitude: str) -> str:
    """Get requests near a point of interest.

    Args:
        latitude: latitude of the coordinate pair for the point of interest
        longitude: longitude of the coordinate pair for the point of interest
    """
    url = f"{SEECLICKFIX_API_BASE}/open311/v2/requests.json?lat={latitude}&long={longitude}"
    data = await make_see_click_fix_request(url)

    requests = [format_request(feature) for feature in data]
    return "\n---\n".join(requests)

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport="stdio")
