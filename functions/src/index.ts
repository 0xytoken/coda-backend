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
