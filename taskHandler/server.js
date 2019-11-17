const express = require('express');
const bodyParser = require('body-parser');


const app = express();

app.enable('trust proxy');

// If you add this filter, you can assure that the result will be correctly parsed
// Idea taken from https://stackoverflow.com/questions/54211890/nodejs-set-body-to-google-cloud-task-queue/54220955
const rawBodySaver = function (req, res, buf, encoding) {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
}
// Use above defined filter with body-parser.
app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: function () { return true } }));

// secure our endpoints 
const secureMiddleware = async (req, res, next) => {
    if(req.header('X-AppEngine-QueueName') != 'my-queue'){
        console.log("No X-AppEngine-QueueName is specified");
        return res.status(403).send('Unauthorized');
    }else{
        next();
        return;
    }
};

app.use(secureMiddleware);


app.post('/handleTask', (req, res) => {
    console.log("X-AppEngine-QueueName is -->> ", req.header('X-AppEngine-QueueName'));
    const bodyData = JSON.parse(req.rawBody);
    console.log(`%%%%  Received task with payload - name : ${bodyData.name} & Job - ${bodyData.job}`  );
    // we need to send this status to tell cloud task about the completion of task.
    res.sendStatus(200);
});

const port = process.env.PORT || 8080;
app.listen(port, ()=>{
    console.log("********** Bravo!!! Handler service is running on ",port);
});