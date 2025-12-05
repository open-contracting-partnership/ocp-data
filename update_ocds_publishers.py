import json
from pathlib import Path

import click
import pandas as pd


@click.command()
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

    publishers = pd.read_csv(
        filename,
        usecols=[
            "Publisher or system name (see note if different from organization)",
            'Country (or "Multiple")',
            "Conforms",
            "Status",
            non_mvp_reason_column,
            date_first_mvp_column,
            "URL",
            "Standard",
        ],
        keep_default_na=False,
    )
    # Include only retrievable OCDS publishers
    publishers = publishers[
        (publishers["Standard"] == "OCDS")
        & (publishers["Conforms"] == "Yes")
        & (publishers["Status"] != "Implementing")
        & (~publishers[non_mvp_reason_column].str.startswith("Retrievable"))
    ]

    with Path("data/oc-status/_index.json").open() as countries_file:
        countries = json.load(countries_file)

    for country in countries:
        publishers_countries = publishers['Country (or "Multiple")']
        if countries[country]["name"] in publishers_countries.to_numpy():
            file_name = f"data/oc-status/{country}"
            with Path(file_name).open() as country_file:
                country_data = json.load(country_file)
                # We clear the list to remove any lapsed publisher
                country_data["results"]["publishers"] = []
                for _index, publisher in publishers[publishers_countries == countries[country]["name"]].iterrows():
                    country_data["results"]["publishers"].append(
                        {
                            "publisher": publisher[
                                "Publisher or system name (see note if different from organization)"
                            ],
                            "publisher_link": publisher["URL"],
                            "ocds_historic_data": True,
                            "ocds_ongoing_data": publisher[non_mvp_reason_column]
                            != "Active: Updated in previous four calendar quarters",
                            "ocds_implementation": False,
                            "year_first_implemented": publisher[date_first_mvp_column][0:4]
                            if publisher[date_first_mvp_column]
                            else None,
                        }
                    )
                with Path(file_name).open("w") as country_file_updated:
                    json.dump(country_data, country_file_updated, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    update_ocds_publishers()
