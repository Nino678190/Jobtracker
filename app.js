const express = require('express');
const app = express();
let { Client, TablesDB, Permission, Role, Account, ID} = require('appwrite');
require('dotenv').config();
const port = process.env.PORT
const cors = require('cors');

app.use(cors())

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_PROJECT_ID);

TablesDB = new TablesDB(client);

app.use(express.json());

app.post('/api/application', async (req, res) => {
    const data = req.body;
    console.log(data)
    const stage = Array.isArray(data.status) ? data.status : [data.status];
    const salary = parseInt(data.salary, 10);
    try {
        let promise = TablesDB.createRow({
            databaseId: process.env.APPWRITE_DATABASE_ID,
            tableId: process.env.APPWRITE_COLLECTION_ID,
            rowId: ID.unique(),
            data: {
                title: data.title,
                company: data.company,
                date_applied: data.date_applied,
                last_interacted: data.last_interacted,
                stage: stage,
                description: data.description,
                place: data.place,
                salary: salary,
                key_task: data.key_tasks,
                userId: data.userId,
            },
            permission: [
                Permission.read(Role.user(data.userId)),
                Permission.update(Role.user(data.userId)),
                Permission.delete(Role.user(data.userId)),
            ],
        });
        promise.then(function(response){
            return res.status(201).send("Added Successfully")
        }, function (error) {
            res.status(error.code).json(error.response)
            console.error(error)
        })
    } catch (error) {
        console.error(error)
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});