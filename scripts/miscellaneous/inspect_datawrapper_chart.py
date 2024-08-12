import json
import requests
import sys

# Base URL for Datawrapper API
base_url = 'https://api.datawrapper.de/v3'


def get_chart_metadata(chart_id, headers):
    """
    Retrieves and prints the metadata of a specified chart from Datawrapper.

    Parameters:
    chart_id (str): The ID of the chart to retrieve metadata for.
    headers (dict): The headers for authentication.

    Returns:
    None
    """
    response = requests.get(f'{base_url}/charts/{chart_id}', headers=headers)
    if response.status_code == 200:
        metadata = response.json()
        print(json.dumps(metadata, indent=4))
    else:
        print(f'Failed to retrieve metadata. Status code: {response.status_code}, error: {response.text}')


if __name__ == '__main__':
    # Your Datawrapper API token
    api_token = sys.argv[1]

    # The chart of which you would like to inspect the metadata
    chart_id = sys.argv[2]

    # Headers for authentication
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    get_chart_metadata(chart_id, headers)
