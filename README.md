# harvesting-import-service

Microservice that harvests knowledge about a harvesting-task from the linked annotated documents 
and writes the resulting triples to the database.

## Installation

To add the service to your stack, add the following snippet to docker-compose.yml:

```
services:
  harvesting-import:
    image: lblod/harvesting-import-service:x.x.x
    volumes:
      - ./data/files:/share
```

## Configuration

### Delta

```
  {
    match: {
      predicate: {
        type: 'uri',
        value: 'http://www.w3.org/ns/adms#status'
      },
      object: {
        type: 'uri',
        value: 'http://lblod.data.gift/harvesting-statuses/ready-for-importing'
      }
    },
    callback: {
      url: 'http://harvesting-import/delta',
      method: 'POST'
    },
    options: {
      resourceFormat: 'v0.0.1',
      gracePeriod: 1000,
      ignoreFromSelf: true
    }
  }
```
### Environment variables

 - TARGET_GRAPH: refers to the graph where the harvested triples will be imported into. 
 Defaults to <http://mu.semte.ch/graphs/public>.

## Validation and correction
The service will validate the triples to import and will try its best to correct the ones that it founds invalid. In case they can't be fixed the service will create a new predicate that links to the old predicate with `<http://centrale-vindplaats.lblod.info/ns/predicates/unparsedFormOf>` , apply that predicate to the triple and insert the object without a datatype.
Example:

Input
```
<https://bertem.meetingburger.net/gr/6c8a0a3c-c9b6-4d47-82d0-8643ea501cb2/notulen> <http://www.w3.org/ns/prov#startedAtTime> "2020-05-26T18:13:00+2"^^<http://www.w3.org/2001/XMLSchema#dateTime>.
```

Output
```
<http://centrale-vindplaats.lblod.info/ns/predicates/e3230ef0-ee88-11ea-8b2a-6179a3bcc5f8> <http://centrale-vindplaats.lblod.info/ns/predicates/unparsedFormOf> <http://www.w3.org/ns/prov#startedAtTime>.
<https://bertem.meetingburger.net/gr/6c8a0a3c-c9b6-4d47-82d0-8643ea501cb2/notulen> <http://centrale-vindplaats.lblod.info/ns/predicates/e3230ef0-ee88-11ea-8b2a-6179a3bcc5f8> "2020-05-26T18:13:00+2".
```
      
## REST API

### POST /delta

Starts the import of the given harvesting-tasks into the db

- Returns `204 NO-CONTENT` if no harvesting-tasks could be extracted.

- Returns `200 SUCCESS` if the harvesting-tasks where successfully processes.

- Returns `500 INTERNAL SERVER ERROR` if something unexpected went wrong while processing the harvesting-tasks.


## Model

### Used prefixes

Prefix | URI 
--- | --- 
harvesting: |  <http://lblod.data.gift/vocabularies/harvesting/>
mu:  | <http://mu.semte.ch/vocabularies/core/>
dct:  | <http://purl.org/dc/terms/>
adms: | <http://www.w3.org/ns/adms#>
prov: | <http://www.w3.org/ns/prov#>
nfo: | <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
nie: | <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>

### Harvesting Task

Periodically this service will create harvesting tasks. The task describes the status and progress of the harvesting flow.

#### Class

`harvesting:HarvestingTask`

### Properties

 Name | Predicate | Range | Definition 
--- | --- | --- | ---
status | `adms:status` | `adms:Status` | Status of the task, initially set to `http://lblod.data.gift/harvesting-statuses/ready-for-collecting`
created |`dct:created`|`xsd:dateTime`| Datetime of creation of the task
modified |`dct:modified`|`xsd:dateTime`| Datetime on which the task was modified
creator |`dct:creator`|`rdfs:Resource`| Creator of the task, in this case the harvest-initiation-service <http://lblod.data.gift/services/harvest-initiation-service>
harvestingCollection |`prov:generated`|`harvesting:HarvestingCollection`| HarvestingCollection generated by the task

#### Harvesting task statuses

The status of the task will be updated by other micro-services to reflect the progress of the harvesting progress. The following statuses are known:

- http://lblod.data.gift/harvesting-statuses/ready-for-collecting
- http://lblod.data.gift/harvesting-statuses/ready-for-importing
- http://lblod.data.gift/harvesting-statuses/importing
- http://lblod.data.gift/harvesting-statuses/success
- http://lblod.data.gift/harvesting-statuses/failure

## HarvestingCollection

The service will create the harvesting collection that will contain the resource/file than needs to be downloaded (and later harvested). This will be updated further/enriched by the `harvest-collector-service`.

### Class

`harvesting:HarvestingCollection`


### Properties

 Name | Predicate | Range | Definition 
--- | --- | --- | ---
status | `adms:status` | `adms:Status`| Status of the task, initially set to `http://lblod.data.gift/collecting-statuses/not-started`
remoteDataObject | `dct:hasPart` | `nfo:RemoteDataObject` | page/resource to be downloaded/collected for this harvesting task

### Collecting statuses

The status of the task will be updated by other micro-services to reflect the progress of the collecting progress. The following statuses are known:

- http://lblod.data.gift/collecting-statuses/not-started

## RemoteDataObject

The service will create an initial remote-data-object for source URL which will be downloaded by the download-url-service.

### Class

`nfo:RemoteDataObject`

### Properties

The model of the remote data object is described in the README of the download-url-service. 
But the following will be needed to initiate a download:

 Name | Predicate | Range | Definition 
--- | --- | --- | ---
status | `adms:status` | `adms:Status`| Status of the task, initially set to `http://lblod.data.gift/file-download-statuses/ready-to-be-cached`
source |`nie:url`| | the URL that needs to be downloaded