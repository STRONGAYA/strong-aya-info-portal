import requests
import json
import os
import sys

_base_url = 'https://api.datawrapper.de/v3/'


def create_chart(api_token, data_path, chart_title):
    """
    Creates a new chart on Datawrapper and uploads the given data to the chart.

    Parameters:
    api_token (str): The Datawrapper API token.
    data_path (str): The path to the data to be uploaded.
    chart_title (str): The title of the chart.

    Returns:
    str: The ID of the created chart.
    """
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    chart_config = {
        'title': chart_title,
        'type': 'tables',
        'language': 'en-GB',
        'metadata': {
            "data": {
                "changes": [],
                "transpose": False,
                "vertical-header": True,
                "horizontal-header": True,
                "external-data": data_path,
                "upload-method": "external-data",
                "external-metadata": "",
                "use-datawrapper-cdn": True
            },
            "describe": {
                "source-name": "",
                "source-url": "",
                "intro": "",
                "byline": "",
                "aria-description": "",
                "number-format": "-",
                "number-divisor": 0,
                "number-append": "",
                "number-prepend": "",
                "hide-title": True
            },
            'visualize': {
                "rows": {
                    "row-0": {
                        "style": {
                            "bold": False,
                            "color": False,
                            "italic": False,
                            "fontSize": 4,
                            "underline": False,
                            "background": False
                        },
                        "format": "0,0.[00]",
                        "moveTo": "top",
                        "sticky": False,
                        "moveRow": False,
                        "stickTo": "top",
                        "borderTop": "none",
                        "borderBottom": "none",
                        "borderTopColor": "#333333",
                        "overrideFormat": False,
                        "borderBottomColor": "#333333"
                    }, },
                "pagination": {
                    "enabled": False,
                    "position": "top"
                },
                'markdown': True,
                "noHeader": True
            },
            "publish": {"embed-width": 1147,
                        "get-the-data": False},
        }
    }

    response = requests.post(_base_url + 'charts', headers=headers, data=json.dumps(chart_config))
    if response.status_code == 201:
        return response.json()['id']
    else:
        print('Failed to create chart:', response.json())
        exit()


def update_data(api_token, chart_id, data_to_upload):
    """
    Updates the data of an existing chart on Datawrapper.

    Parameters:
    api_token (str): The Datawrapper API token.
    chart_id (str): The ID of the chart to update.
    data_to_upload (str): The data to upload to the chart.
    """
    upload_data_url = f'{_base_url}charts/{chart_id}/data'
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'text/csv'
    }

    response = requests.put(upload_data_url, headers=headers, data=data_to_upload)
    if response.status_code in [204, 201]:
        print("Dataset uploaded successfully.")
    else:
        print(f"Failed to upload dataset. Status code: {response.status_code}, Error: {response.text}")
        exit()


def publish_chart(api_token, chart_id):
    """
    Publishes an existing chart on Datawrapper.

    Parameters:
    api_token (str): The Datawrapper API token.
    chart_id (str): The ID of the chart to publish.
    """
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    publish_url = f'{_base_url}charts/{chart_id}/publish'
    response = requests.post(publish_url, headers=headers)
    if response.status_code == 200:
        print(f"Chart published successfully: {response.json()['url']}")
    else:
        print('Failed to publish the chart:', response.json())


def retrieve_embedding_component(api_token, chart_id):
    """
    Retrieves the web component embedding code for a chart on Datawrapper.

    Parameters:
    api_token (str): The Datawrapper API token.
    chart_id (str): The ID of the chart to retrieve the embedding code for.

    Returns:
    str: The embedding code for the chart.
    """
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    response = requests.get(f'{_base_url}charts/{chart_id}', headers=headers)
    if response.status_code == 200:
        return response.json()['metadata']['publish']['embed-codes']["embed-method-web-component"]
    else:
        print('Failed to retrieve embedding code:', response.json())
        exit()


if __name__ == '__main__':
    # Get the Datawrapper API token and plotting information path from command line arguments
    datawrapper_api_token = sys.argv[1]
    plotting_information_path = sys.argv[2]

    # Load plotting information from JSON file
    with open(os.path.join(os.path.dirname(os.getcwd()), plotting_information_path), 'r') as f:
        plotting_info = json.load(f)

    # Create and publish charts for each variable in plotting information
    for variable in plotting_info:
        if plotting_info[variable]['chart_id'] is None:
            chart_id = create_chart(datawrapper_api_token, plotting_info[variable]['data_location'],
                                    plotting_info[variable]['chart_title'])
            plotting_info[variable]['chart_id'] = chart_id
            publish_chart(datawrapper_api_token, chart_id)
            embedding_code = retrieve_embedding_component(datawrapper_api_token, chart_id)
            plotting_info[variable]['embedding_code'] = embedding_code

    # Save updated plotting information back to JSON file
    with open(plotting_information_path, 'w') as f:
        json.dump(plotting_info, f)
