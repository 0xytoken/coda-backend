import * as functions from "firebase-functions";
import * as ax from "axios";

const axios = ax.default;

exports.httpRequest = functions.https.onRequest((req, res) => {
  try {
    const body = JSON.parse(req.body);
    switch (body.method) {
      case "POST":
        console.log("POST");
        console.log(body.url);
        console.log("body.body " + body.body);
        axios
            .post(body.url, body.body)
            .then((response: ax.AxiosResponse) => {
              console.log(JSON.stringify(response.data));
              res.end(JSON.stringify(response.data));
            })
            .catch((error: ax.AxiosError) => {
              console.error(JSON.stringify(error));
              res.status(401).end(req.ip);
            });
        return;
      case "GET":
        console.log("GET");
        axios
            .get(body.url, body.body)
            .then((response: ax.AxiosResponse) => {
              console.log(JSON.stringify(response.data));
              res.end(response.data);
            })
            .catch((error: ax.AxiosError) => {
              console.error(JSON.stringify(error));
              res.status(402).end(req.ip);
            });
        return;
      default:
        res.status(403).end(req.ip);
        return;
    }
  } catch (e) {
    res.status(404).end(req.ip);
    console.log(e);
  }
});

exports.jsonToCodaSchema = functions.https.onRequest((req, res) => {
  let code = "coda.makeObjectSchema({properties: {";
  code += dataRecursion(req.body.data, req.body.shouldIncludeEmptyArrays);
  code += "}});";
  res.end(code);
});

/**
 * Adds two numbers together.
 * @param {Object} data the JSON object to be converted to the coda Schema.
 * @param {boolean} shouldIncludeEmptyArrays whether empty Arrays should be
 * included.If this is set to 'true' you will have to manually adjust the
 * result to specify the type of Array.
 * @return {String} Your generated Coda Scheme.
 */
function dataRecursion(
    data: object,
    shouldIncludeEmptyArrays: boolean
): string {
  let code = "";
  if (data !== undefined && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (key.length > 0) {
        switch (typeof value) {
          case "object":
            if (
              value instanceof Array &&
              (shouldIncludeEmptyArrays || value.length > 0)
            ) {
              code += `${key}: { type: coda.ValueType.Array, 
                                fromKey: "${key}", items:\n`;
              switch (typeof value[0]) {
                case "number":
                  code += `{ type: 
                                        coda.ValueType.Number },\n },\n`;
                  break;
                case "string":
                  code += `{ type: 
                                        coda.ValueType.String },\n },\n`;
                  break;
                case "boolean":
                  code += `{ type: 
                                        coda.ValueType.Boolean },\n },\n`;
                  break;
                case "object":
                  code += `{ type: coda.ValueType.Object, \n properties: 
                          {${dataRecursion(value, shouldIncludeEmptyArrays)}}
                          ,\n },\n },\n`;
                  break;
                default:
                  code += "{type: ***TODO***}}\n";
                  break;
              }
            } else {
              if (value && Object.keys(value).find((val) => val.length > 0)) {
                code += `${key}: 
                                { type: coda.ValueType.Object, 
                                    fromKey: "${key}",\n properties: 
                                    {${dataRecursion(
      value,
      shouldIncludeEmptyArrays
  )}}},`;
              }
            }
            break;
          case "string":
            code += `${key}: 
                        { type: coda.ValueType.String, fromKey: "${key}" },\n`;
            break;
          case "number":
            code += `${key}: 
                        { type: coda.ValueType.Number, fromKey: "${key}" },\n`;
            break;
          case "boolean":
            code += `${key}: 
                        { type: coda.ValueType.Boolean, fromKey: "${key}" },\n`;
            break;
          default:
            break;
        }
      }
    }
  }
  return code;
}
