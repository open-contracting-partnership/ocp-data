# OCP Data
This repository contains the data that is managed through [OCP forms](http://survey.open-contracting.org). The general public can suggest edits to the data, but only collaborators with access to this repo can decide to accept these suggestions.

The structure of these surveys is defined in the `/forms` folder, using [JSON schema](http://json-schema.org/).

## Serving the data
The final JSON data is served statically from the `publish` branch. When accepting an edit and merging the Pull Request to `master`, Travis runs a script that processes the data and optimizes it for use in other applications. This includes the map on the [Open Contracting website](http://open-contracting.org).
