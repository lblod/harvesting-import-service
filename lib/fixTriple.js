import { validateTerm } from "./validateTriple";
import { Parser, Writer, DataFactory } from "n3";
/**
 * Returns a promise that resolved to a string representation of a triple
 * if it could be fixed or to undefined if it couldn't
 *
 * @param triple the triple to be fixed
 */
export default function fixTriple(triple) {
  return new Promise((resolve) => {
    const parser = new Parser();
    parser.parse(triple, (error, quad) => {
      if (error) {
        console.log(error);
        resolve(undefined);
      } else {
        if (!quad) return resolve(undefined);

        const termTypes = [
          quad.subject.termType,
          quad.predicate.termType,
          quad.object.termType,
        ];

        if (termTypes.indexOf("BlankNode") > -1) {
          return resolve(undefined); //Note: null would be better
        }

        const subject = fixTerm(quad.subject);
        if (!subject) return resolve(undefined);

        const predicate = fixTerm(quad.predicate);
        if (!predicate) return resolve(undefined);

        const object = fixTerm(quad.object);
        if (!object) return resolve(undefined);

        const writer = new Writer();
        writer.addQuad(subject, predicate, object);
        writer.end((err, result) => {
          if (err) {
            console.log(err);
            resolve(undefined);
          } else {
            resolve(result);
          }
        });
      }
    });
  });
}

/**
 * Tries to fix a particular term (subject, predicate or object) of a triple
 * if it can fix it it or if it is already valid, returns the fixed term, if not
 * returns undefined
 *
 * @param term the term to be fixed
 */
function fixTerm(term) {
  if (validateTerm(term)) {
    return term;
  } else {
    if (term.datatype) {
      if (term.datatype.value === "http://www.w3.org/2001/XMLSchema#boolean") {
        return fixBoolean(term);
      } else if (
        term.datatype.value === "http://www.w3.org/2001/XMLSchema#date"
      ) {
        return fixDate(term);
      } else if (
        term.datatype.value === "http://www.w3.org/2001/XMLSchema#dateTime"
      ) {
        return fixDateTime(term);
      } else if (
        term.datatype.value === "http://www.w3.org/2000/01/rdf-schema#Literal"
      ) {
        return fixLiteral(term);
      } else if (
        term.datatype.value ===
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString" ||
        term.datatype.value ===
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral"
      ) {
        return fixLiteral(term);
      } else if (
        term.datatype.value === "http://www.w3.org/2001/XMLSchema#int"
      ) {
        return fixInteger(term);
      } else if (term.datatype.value === "http://www.opengis.net/ont/geosparql#wktLiteral") {
        return fixWktLiteral(term);
      }
    }
    return undefined;
  }
}

function fixWktLiteral(term) {
  let value = term.value;
  if (!value?.length) {
    return undefined;
  }
  try {
    const regex = /<(https?:\/\/[^\s>]+)>/;
    const urlCRS = value.match(regex);

    if (urlCRS) {
      return DataFactory.literal(
        value.replace("https", "http"),
        DataFactory.literal("http://www.opengis.net/ont/geosparql#wktLiteral"),
      );
    } else {
      return DataFactory.literal(
        value,
        DataFactory.literal("http://www.opengis.net/ont/geosparql#wktLiteral"),
      );
    }
  } catch (e) {
    console.log(`invalid url '${value}'. error: ${e}`);
    return undefined;
  }

}
/** 
 * Tries to fix a boolean term if it can fix it it returns the fixed term, if not
 * returns undefined
 *
 * @param term the boolean term to be fixed
 */
function fixBoolean(term) {
  const lowercaseValue = term.value.toLowerCase();
  if (lowercaseValue === "true" || lowercaseValue === "false") {
    return DataFactory.literal(
      lowercaseValue,
      DataFactory.literal("http://www.w3.org/2001/XMLSchema#boolean"),
    );
  } else {
    return undefined;
  }
}

/**
 * Tries to fix a date term if it can fix it it returns the fixed term, if not
 * returns undefined
 *
 * @param term the date term to be fixed
 */
function fixDate(term) {
  const value = term.value;
  const date = new Date(value);
  if (isValidDate(date)) {
    const year = date.getFullYear();
    const month =
      date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate();
    const newValue = `${year}-${month}-${day}`;
    return DataFactory.literal(
      newValue,
      DataFactory.literal("http://www.w3.org/2001/XMLSchema#date"),
    );
  }
}

function fixInteger(term) {
  if (isNaN(Number(term.value))) {
    return undefined;
  } else {
    return DataFactory.literal(
      term.value,
      DataFactory.literal("http://www.w3.org/2001/XMLSchema#integer"),
    );
  }
}
/**
 * Returns if a js date is valid
 *
 * @param date the date to be validated
 */
function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

function fixLiteral(term) {
  const value = term.value;
  return DataFactory.literal(
    value,
    DataFactory.literal("http://www.w3.org/2001/XMLSchema#string"),
  );
}

/**
 * Tries to fix a datetime term if it can fix it it returns the fixed term, if not
 * returns undefined
 *
 * @param term the datetime term to be fixed
 */
function fixDateTime(term) {
  const value = term.value;
  const date = new Date(value);
  if (isValidDate(date)) {
    const year = date.getFullYear();
    const month =
      date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const seconds = date.getSeconds();
    const newValue = `${year}-${month}-${day}T${hour}:${minute}:${seconds}`;
    return DataFactory.literal(
      newValue,
      DataFactory.literal("http://www.w3.org/2001/XMLSchema#dateTime"),
    );
  }
}
