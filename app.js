const express = require('express');
const app = express();
const { Client, TablesDB, Permissions, Role} = require('appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject(process.env.APPWRITE_PROJECT_ID);

const TablesDB = new TablesDB(client);

app.use(express.json());

app.post('/api/application', async (req, res) => {
    const data = req.body;

    try {
        let promise = TablesDB.createRow(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_COLLECTION_ID,
            {
                title: data.title,
                company: data.company,
                date_applied: data.date_applied,
                last_interacted: data.last_interacted,
                status: data.status,
                description: data.description,
                place: data.place,
                salary: data.salary,
                key_tasks: data.key_tasks
            },
            [
                Permissions.read(Role.user(data.userId)),
                Permissions.update(Role.user(data.userId)),
                Permissions.delete(Role.user(data.userId))
            ]
        )
        promise.then(function(response){
            console.log(response)
            if (response.status === 201){
                return res.status(201).send("Added Successfully")
            }
        }, function (error) {
            console.error(error)
        })
    } catch {
        console.error('vgz')
    }
})
