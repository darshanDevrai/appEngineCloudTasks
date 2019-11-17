// Imports the Google Cloud Tasks library.
const {CloudTasksClient} = require('@google-cloud/tasks');

// Instantiates a client.
const client = new CloudTasksClient();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// replace with your values
const project = 'cloudtaskdemo';
const queue = 'my-queue';
const location = 'us-central1';

// Construct the fully qualified queue name.
const parent = client.queuePath(project, location, queue);


app.get('/createTask', async (req, res) => {
    const payload = {
        name : 'The mandalorian',
        job : 'collect bounty'
    }

    // We will create this task-handler service and handleTask route later.
    const task = {
        appEngineHttpRequest: {
          httpMethod: 'POST',
          appEngineRouting: {
            service : 'task-handler'
          },
          relativeUri: '/handleTask',
          body: Buffer.from(JSON.stringify(payload)).toString('base64')
        },
    };
    // create a request object
    const request = {
        parent: parent,
        task: task,
    };
    console.log('Sending app engine task:');
    console.log(task);
    // Send create task request.
    const [response] = await client.createTask(request);
    const name = response.name;
    console.log(`Created task ${name}`);
    res.send({"response":response});


});

// Basic route to verify app is serving
app.get('/', (req, res)=>{
    res.send("default working");
});


const port = process.env.PORT || 8080;

app.listen(port, ()=>{
    console.log("###### Bravo!!! default service running on ",port);
});