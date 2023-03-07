export const TASK_HARVESTING_IMPORTING = 'http://lblod.data.gift/id/jobs/concept/TaskOperation/importing';

export const STATUS_BUSY = 'http://redpencil.data.gift/id/concept/JobStatus/busy';
export const STATUS_SCHEDULED = 'http://redpencil.data.gift/id/concept/JobStatus/scheduled';
export const STATUS_SUCCESS = 'http://redpencil.data.gift/id/concept/JobStatus/success';
export const STATUS_FAILED = 'http://redpencil.data.gift/id/concept/JobStatus/failed';

export const JOB_TYPE = 'http://vocab.deri.ie/cogs#Job';
export const TASK_TYPE = 'http://redpencil.data.gift/vocabularies/tasks/Task';
export const ERROR_TYPE= 'http://open-services.net/ns/core#Error';
export const ERROR_URI_PREFIX = 'http://redpencil.data.gift/id/jobs/error/';

export const BASIC_AUTH = 'https://www.w3.org/2019/wot/security#BasicSecurityScheme';
export const OAUTH2 = 'https://www.w3.org/2019/wot/security#OAuth2SecurityScheme';

export const PREFIXES = `
  PREFIX harvesting: <http://lblod.data.gift/vocabularies/harvesting/>
  PREFIX terms: <http://purl.org/dc/terms/>
  PREFIX prov: <http://www.w3.org/ns/prov#>
  PREFIX nie: <http://www.semanticdesktop.org/ontologies/2007/01/19/nie#>
  PREFIX ext: <http://mu.semte.ch/vocabularies/ext/>
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX muAccount: <http://mu.semte.ch/vocabularies/account/>
  PREFIX meb: <http://rdf.myexperiment.org/ontologies/base/>
  PREFIX task: <http://redpencil.data.gift/vocabularies/tasks/>
  PREFIX dct: <http://purl.org/dc/terms/>
  PREFIX oslc: <http://open-services.net/ns/core#>
  PREFIX cogs: <http://vocab.deri.ie/cogs#>
  PREFIX adms: <http://www.w3.org/ns/adms#>
  PREFIX dgftSec: <http://lblod.data.gift/vocabularies/security/>
  PREFIX dgftOauth: <http://kanselarij.vo.data.gift/vocabularies/oauth-2.0-session/>
  PREFIX wotSec: <https://www.w3.org/2019/wot/security#>
  PREFIX rpioHttp: <http://redpencil.data.gift/vocabularies/http/>
  PREFIX nfo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#>
`;
