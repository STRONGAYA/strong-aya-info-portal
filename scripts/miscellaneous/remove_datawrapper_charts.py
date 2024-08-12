import requests
import sys

# Base URL for Datawrapper API
base_url = 'https://api.datawrapper.de/v3'


def remove_charts(headers, chart_ids=None):
    """
    Deletes charts from Datawrapper based on provided chart IDs or all charts if no IDs are provided.

    Parameters:
    headers (dict): The headers to use for the API requests, including authorisation.
    chart_ids (list, optional): A list of chart IDs to delete.
    If None, all charts will be deleted.

    Returns:
    None
    """
    if chart_ids is None:
        print('No chart IDs provided. All charts will be deleted.')
        input('Press Enter to confirm or Ctrl+C to cancel.')

    charts = [{'id': chart_id} for chart_id in chart_ids] if chart_ids else (
        requests.get(f'{base_url}/charts', headers=headers).json())['list']

    for chart in charts:
        chart_id = chart['id']
        delete_response = requests.delete(f'{base_url}/charts/{chart_id}', headers=headers)
        status = 'Successfully' if delete_response.status_code == 204 else 'Failed'
        print(f'{status} deleted chart with ID: {chart_id}, Status Code: {delete_response.status_code}')


if __name__ == '__main__':
    # Your Datawrapper API token
    api_token = sys.argv[1]

    # The charts that you would like to delete
    chart_ids = sys.argv[2]

    # Headers for authentication
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }
    remove_charts(headers, chart_ids)
