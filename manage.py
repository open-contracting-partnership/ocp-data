import json
from pathlib import Path

import click
import pandas as pd


@click.group()
def cli():
    pass


@cli.command()
@click.argument("filename")
def update_ocds_publishers(filename):
    """
    Update the list of OCDS publishers for each country listed in data/oc-status/_index.json using a CSV file.

    The CSV file must be exported from the OCP's MEL1 sheet.
    """
    # The columns name and values must match the MEL 1 spreadsheet columns name and values
    # https://docs.google.com/spreadsheets/d/1NuGNEHpNFxrK-Vf0zGTWVEjrgqt2nYmKDbGN9FLp-k4/edit?gid=1539522696#gid=1539522696
    non_mvp_reason_column = "Reason for non-MVP status"
    date_first_mvp_column = "Date of first MVP"
    publisher_name_column = "Publisher or system name (see note if different from organization)"
    country_column = 'Country (or "Multiple")'
    conforms_column = "Conforms"
    status_column = "Status"
    url_column = "URL"
    standard_column = "Standard"

    publishers = pd.read_csv(
        filename,
        usecols=[
            publisher_name_column,
            country_column,
            conforms_column,
            status_column,
            non_mvp_reason_column,
            date_first_mvp_column,
            url_column,
            standard_column,
        ],
        keep_default_na=False,
    )
    # Include only retrievable OCDS publishers
    publishers = publishers[
        (publishers[standard_column] == "OCDS")
        & (publishers[conforms_column] == "Yes")
        & (publishers[status_column] != "Implementing")
        & (~publishers[non_mvp_reason_column].str.startswith("Retrievable"))
    ]

    with Path("data/oc-status/_index.json").open() as f:
        countries = json.load(f)

    for country in countries:
        publishers_countries = publishers[country_column]
        if countries[country]["name"] in publishers_countries.to_numpy():
            file_name = f"data/oc-status/{country}"
            with Path(file_name).open() as f:
                country_data = json.load(f)
                # We clear the list to remove any lapsed publisher
                country_data["results"]["publishers"] = []
            for _index, publisher in publishers[publishers_countries == countries[country]["name"]].iterrows():
                country_data["results"]["publishers"].append(
                    {
                        "publisher": publisher[publisher_name_column],
                        "publisher_link": publisher[url_column],
                        "ocds_historic_data": True,
                        "ocds_ongoing_data": publisher[non_mvp_reason_column]
                        != "Active: Updated in previous four calendar quarters",
                        "ocds_implementation": False,
                        "year_first_implemented": publisher[date_first_mvp_column][0:4]
                        if publisher[date_first_mvp_column]
                        else None,
                    }
                )
            with Path(file_name).open("w") as f:
                json.dump(country_data, f, indent=2, ensure_ascii=False)
                f.write("\n")


if __name__ == "__main__":
    cli()
