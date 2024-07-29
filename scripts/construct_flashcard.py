import json
import os
import sys

import pandas as pd


def construct_flashcard(aggregated_data_path, variable, positive_strata, negative_strata):
    """
    Constructs a flashcard based on the counts of positive and negative strata in the given data.

    :param str aggregated_data_path: The path to the JSON file containing the aggregated data.
    :param str variable: The variable/column name in the DataFrame to analyze.
    :param list positive_strata: A list of values considered as positive strata.
    :param list negative_strata: A list of values considered as negative strata.
    :return: The path to the saved flashcard CSV file.
    :rtype: str
    """
    # Load the JSON file into a DataFrame
    aggregated_data = pd.read_json(aggregated_data_path)

    # Filter the DataFrame based on the variable column
    flashcard_data = aggregated_data[aggregated_data['Variable'] == variable]

    # Calculate the counts for the positive and negative strata
    positive_counts = flashcard_data[flashcard_data['Value'].isin(positive_strata)]['count'].sum()
    negative_counts = flashcard_data[flashcard_data['Value'].isin(negative_strata)]['count'].sum()
    total_counts = positive_counts + negative_counts

    # Calculate the ratio of positive and negative counts to the total counts
    positive_ratio = positive_counts / total_counts
    negative_ratio = negative_counts / total_counts

    # Distribute the maximum number of icons based on these ratios
    relative_positive_icons = int(_max_icons * positive_ratio)
    relative_negative_icons = int(_max_icons * negative_ratio)

    # Ensure the sum of relative icons does not exceed _max_icons
    if relative_positive_icons + relative_negative_icons > _max_icons:
        excess = (relative_positive_icons + relative_negative_icons) - _max_icons
        if relative_positive_icons > relative_negative_icons:
            relative_positive_icons -= excess
        else:
            relative_negative_icons -= excess

    # Create the flashcard string with the appropriate number of icons
    flashcard = [f"{_positive_icon * relative_positive_icons} {_negative_icon * relative_negative_icons}"]

    # Convert the flashcard to a CSV format with consistent line endings
    csv_data = pd.DataFrame(flashcard, columns=[variable]).to_csv(
        index=False, lineterminator='\n').replace(' ', '')

    # Save the csv flashcard
    output_dir = os.path.join('data', 'flashcards')
    os.makedirs(output_dir, exist_ok=True)
    with open(os.path.join(output_dir, f'{variable}_flashcard.csv'), 'w') as f:
        f.write(csv_data)

    return f'{variable}_flashcard.csv'


if __name__ == '__main__':
    # Get command line arguments
    aggregate_data_path = sys.argv[1]
    plotting_information_path = sys.argv[2]
    repository_path = sys.argv[3]

    # Set global variables for icons and their maximum amount (plus 1)
    _positive_icon = rf"![person]({repository_path}/web/images/Datawrapper_assests/person-orange.svg) "
    _negative_icon = rf"![person]({repository_path}/web/images/Datawrapper_assests/person-grey.svg) "
    _max_icons = 101

    # Load plotting information from JSON file
    with open(os.path.join(os.path.dirname(os.getcwd()), plotting_information_path), 'r') as f:
        plotting_info = json.load(f)

    # Construct flashcards for each variable in plotting information
    for variable in plotting_info:
        flashcard_path = construct_flashcard(aggregate_data_path, variable, plotting_info[variable]['positive_strata'],
                                             plotting_info[variable]['negative_strata'])
        plotting_info[variable]['data_location'] = rf"{repository_path}/data/flashcards/{flashcard_path}"

    # Save updated plotting information back to JSON file
    with open(os.path.join(os.path.dirname(os.getcwd()), plotting_information_path), 'w') as f:
        json.dump(plotting_info, f)