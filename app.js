import {app, errorHandler} from 'mu';

import flatten from 'lodash.flatten';
import bodyParser from 'body-parser';

import {
  importHarvestingTask,
  TASK_FAILURE,
  TASK_ONGOING,
  TASK_READY,
  TASK_SUCCESS,
  updateTaskStatus
} from "./lib/harvesting-task";

app.use(bodyParser.json({
  type: function (req) {
    return /^application\/json/.test(req.get('content-type'));
  }
}));

app.get('/', function (req, res) {
  res.send('Hello harvesting-import-service');
});

app.post('/delta', async function (req, res, next) {

  const tasks = getTasks(req.body);
  if (!tasks.length) {
    console.log("Delta does not contain new harvesting tasks  with status 'ready-for-importing'. Nothing should happen.");
    res.status(204).send();
  }

  for (let task of tasks) {
    try {
      await updateTaskStatus(task, TASK_ONGOING);
      await importHarvestingTask(task);
      await updateTaskStatus(task, TASK_SUCCESS);
    } catch (e) {
      console.log(`Something went wrong while importing the harvesting task <${task}>`);
      console.error(e);
      try {
        await updateTaskStatus(task, TASK_FAILURE);
      } catch (e) {
        console.log(`Failed to update state of task <${task}> to failure state. Is the connection to the database broken?`);
        console.error(e);
        res.status(400).send().end();
      }
      res.status(400).send().end();
    }
  }
  res.status(200).send().end();
});


/**
 * Returns the inserted ready-for-import harvesting task URIs
 * from the delta message. An empty array if there are none.
 *
 * @param delta body as received from the delta notifier
 */
function getTasks(delta) {
  const inserts = flatten(delta.map(changeSet => changeSet.inserts));
  return inserts.filter(isTriggerTriple).map(t => t.subject.value);
}

/**
 * Returns whether the passed triple is a trigger for an import process
 *
 * @param triple as received from the delta notifier
 */
function isTriggerTriple(triple) {
  return triple.predicate.value === 'http://www.w3.org/ns/adms#status'
    && triple.object.value === TASK_READY;
}

app.use(errorHandler);