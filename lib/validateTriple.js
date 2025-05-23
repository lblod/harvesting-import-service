import N3 from "n3";

/**
 * Returns a promise that resolves to a boolean value that represents if
 * the triple is valid or not
 *
 * @param triple the triple to be validated
 */
export default function validateTriple(triple) {
  return new Promise((resolve) => {
    const parser = new N3.Parser();
    parser.parse(triple, (error, quad) => {
      if (error) {
        console.log("error parsing triple:", error);
        resolve(false);
      } else {
        const valid =
          quad &&
          validateTerm(quad.subject) &&
          validateTerm(quad.predicate) &&
          validateTerm(quad.object);
        resolve(valid);
      }
    });
  });
}

/**
 * Returns a boolean value that represents if a term (subject, predicate or object) of a triple is valid or not
 *
 * @param term the term to be validated
 */
export function validateTerm(term) {
  if (term.termType == "BlankNode") {
    return false;
  } else if (!term.datatype) {
    return true; //If the term doesn't have a datatype it means it will be valid on virtuoso
  } else {
    const datatype = term.datatype.value;
    if (datatype === "http://www.w3.org/2000/01/rdf-schema#Literal") {
      return false;
    } else if (
      datatype === "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"
    ) {
      return validateLangString(term.language);
    } else if (datatype === "http://www.w3.org/2001/XMLSchema#string") {
      return true;
    } else if (datatype === "http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML") {
      return true;
    } else if (
      datatype === "http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral"
    ) {
      return false;
    } else if (datatype === "http://www.w3.org/2001/XMLSchema#boolean") {
      return validateBoolean(term.value);
    } else if (datatype === "http://www.w3.org/2001/XMLSchema#date") {
      return validateDate(term.value);
    } else if (datatype === "http://www.w3.org/2001/XMLSchema#dateTime") {
      return validateDateTime(term.value);
    } else if (datatype === "http://www.w3.org/2001/XMLSchema#integer") {
      return validateNumber(term.value);
    } else if (datatype === "http://www.opengis.net/ont/geosparql#wktLiteral") {
      return validateWkLiteral(term.value);
    }
    else {
      return false;
    }
  }
}

function validateWkLiteral(value) {
  // validate http scheme
  if (!value?.length) {
    return false;
  }
  try {
    const regex = /<(https?:\/\/[^\s>]+)>/;
    const urlCRS = value.match(regex);

    if (urlCRS) {
      let url = new URL(urlCRS[1]);
      return url.protocol === 'http:';
    } else {
      return true; // assuming ok
    }
  } catch (e) {
    console.log(`invalid url '${value}'. error: ${e}`);
    return false;
  }
}

function validateLangString(value) {
  return value?.length > 0;
}

/**
 * Returns a boolean value that represents if a boolean term is valid or not
 *
 * @param term the term to be validated
 */
function validateBoolean(value) {
  return value === "true" || value === "false";
}

/**
 * Returns a boolean value that represents if a date term is valid or not
 *
 * @param term the term to be validated
 */
function validateDate(value) {
  const dateRegex =
    /^-?[0-9][0-9][0-9][0-9]+-[0-9][0-9]-[0-9][0-9](([-+][0-9][0-9]:[0-9][0-9])|Z)?$/;
  // see http://www.datypic.com/sc/xsd/t-xsd_date.html
  //TODO invalid dates are not checked like 1997-99-99
  return dateRegex.test(value);
}

/**
 * Returns a boolean value that represents if a datetime term is valid or not
 *
 * @param term the term to be validated
 */
function validateDateTime(value) {
  const dateTimeRegex =
    /^-?[0-9][0-9][0-9][0-9]+-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9](\.[0-9]+)?(([-+][0-9][0-9]:[0-9][0-9])|Z)?$/;
  // see http://books.xmlschemata.org/relaxng/ch19-77049.html
  //TODO invalid dates are not checked like 1997-99-99 or invalid times like 26:78:98
  return dateTimeRegex.test(value);
}

/**
 * Returns a boolean value that represents if a number term is valid or not
 *
 * @param term the term to be validated
 */
function validateNumber(value) {
  const numberValue = Number(value);
  return !isNaN(numberValue);
}
