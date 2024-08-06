import json
import os
import sys

from vantage6.client import UserClient as Client


def retrieve_categorical_descriptives(config, plotting_info):
    """
    Retrieve federated descriptive data.

    This function authenticates a client, creates a task for the client to retrieve the
    descriptive data, waits for the results to be ready, and then returns the results.

    Parameters:
    config (dict or str): Configuration details. If a string, it will be parsed as JSON.
        - collaboration (int or str): The collaboration ID.
        - aggregating_organisation (int or str): The organisation ID of the aggregating organisation.
        - server_url (str): The server URL.
        - server_port (int or str): The server port.
        - server_api (str): The server API.
        - username (str): The username for authentication.
        - password (str): The password for authentication.
        - organization_key (str): The private key of the user's organisation to set up end-to-end encryption.
    plotting_info (dict or str): Plotting information. If a string, it will be parsed as JSON.
        - Example structure:
            {
              "variable_name": {
                "variable_identifier": "variable_a",
                "chart_id": null,
                "chart_title": "A title of your chart",
                "data_location": null,
                "positive_strata": [
                  "variable_b",
                  "example_ontoloy:code_to_mark_as_positive"
                ],
                "negative_strata": [
                  "example_ontoloy:code_to_mark_as_negative"
                ]
              }
            }

    Returns:
    dict: A dictionary containing the result data.
    """
    try:
        # Authenticate the client
        client = _authenticate(config)
    except Exception as e:
        print(f"ERROR - Vantage6 implementation - Attempting to authenticate the Vantage6 user resulted in an error, "
              f"is the configuration correct?\n"
              f"error: {e}")
        return """[
            {
                ""
            }
        ]"""

    # When passed as GitHub secrets, the values might be interpreted as strings
    if isinstance(config.get("collaboration"), str):
        config["collaboration"] = int(config.get("collaboration"))
    if isinstance(config.get("aggregating_organisation"), str):
        config["aggregating_organisation"] = [int(config.get("aggregating_organisation"))]

    if isinstance(config.get("aggregating_organisation"), int):
        config["aggregating_organisation"] = [config.get("aggregating_organisation")]

    # Prepare variables to describe
    variables_to_describe = {
        info["variable_identifier"]: {"datatype": "categorical"}
        for info in plotting_info.values()
    }

    # Create a task for the client to retrieve the descriptive data
    task = client.task.create(
        collaboration=config.get("collaboration"),
        organizations=config.get("aggregating_organisation"),
        name="Non-expert descriptive retrieval",
        image="ghcr.io/strongaya/v6-descriptive-statistics:v1.0.0-beta",
        description="Retrieval of descriptive statistics for the non-expert information portal",
        input_={"method": "central",
                "kwargs": {"variables_to_describe": variables_to_describe}},
        databases=[{"label": "csv"}]
    )

    # Wait for results to be ready
    print("Waiting for results")
    task_id = task['id']
    _result = client.wait_for_results(task_id)

    # Retrieve the results
    result = client.result.from_task(task_id=task_id)
    return result['data'][0]['result']


def _authenticate(config):
    """
    Authenticate a client.

    This function creates a client with the given configuration details, authenticates the client,
    and sets up encryption for the client.

    Parameters:
    config (dict): Configuration details.
        - server_url (str): The server URL.
        - server_port (int or str): The server port.
        - server_api (str): The server API.
        - username (str): The username for authentication.
        - password (str): The password for authentication.
        - organization_key (str): The private key of the user's organisation to set up end-to-end encryption.

    Returns:
    Client: An authenticated client with encryption set up.
    """
    # Create a client
    client = Client(config.get("server_url"), config.get("server_port"), config.get("server_api"),
                    log_level="debug")
    # Authenticate the client
    client.authenticate(config.get("username"), config.get("password"))

    # Set up encryption for the client
    if config.get("organization_key") == "":
        config["organization_key"] = None
    client.setup_encryption(config.get("organization_key"))

    return client


if __name__ == "__main__":
    # Read configuration and plotting information from command line arguments
    vantage6_config_path = sys.argv[1]
    plotting_info_path = sys.argv[2]

    # Attempt to retrieve the configuration and plotting information
    with open(vantage6_config_path, "r") as f:
        config = json.load(f)

    with open(plotting_info_path, "r") as f:
        plotting_info = json.load(f)

    result = retrieve_categorical_descriptives(config, plotting_info)

    # Check if the path exists or create it
    output_dir = os.path.join("data", "raw")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Save the result in the appropriate location
    with open(os.path.join(output_dir, "vantage6_result.json"), "w") as f:
        json.dump(result, f, indent=4)
