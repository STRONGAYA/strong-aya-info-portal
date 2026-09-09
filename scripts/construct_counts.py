import csv
import json
import os
import sys


def construct_counts(aggregated_data, variable, categories):
    """
    Sum the federated counts of a variable into the categories shown on the portal.

    :param dict aggregated_data: The 'categorical_descriptives' table of the Vantage6 result
        (columns 'variable', 'value' and 'count', each a dict indexed by row).
    :param str variable: The variable identifier in the aggregated data.
    :param dict categories: Portal category -> list of raw values that belong to it.
    :return: Category -> number of people.
    :rtype: dict
    """
    counts = {category: 0 for category in categories}
    lookup = {_key(value): category for category, values in categories.items() for value in values}

    for row in aggregated_data['variable']:
        if aggregated_data['variable'][row] != variable:
            continue
        category = lookup.get(_key(aggregated_data['value'][row]))
        if category is not None:
            counts[category] += int(aggregated_data['count'][row])

    return counts


def _key(value):
    # Values may arrive as numbers or as strings ('1.0'); compare them alike
    try:
        return str(float(value))
    except (TypeError, ValueError):
        return str(value)


def write_counts_csv(output_dir, variable, counts):
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, f'{variable}.csv')
    with open(path, 'w', newline='') as f:
        writer = csv.writer(f, lineterminator='\n')
        writer.writerow(['category', 'count'])
        for category, count in counts.items():
            writer.writerow([category, count])
    return path


if __name__ == '__main__':
    # Get command line arguments
    aggregate_data_path = sys.argv[1]
    variables_path = sys.argv[2]

    # Load aggregated data from JSON file
    with open(aggregate_data_path, 'r') as f:
        aggregate_data = json.loads(json.loads(json.load(f))['categorical_descriptives'])

    # Load the variable -> category -> raw values mapping
    with open(variables_path, 'r') as f:
        variables = json.load(f)

    # Write one counts CSV per variable for the website
    for variable_identifier, categories in variables.items():
        counts = construct_counts(aggregate_data, variable_identifier, categories)
        print(write_counts_csv(os.path.join('web', 'data'), variable_identifier, counts), counts)
