require('dotenv').config();
import { DataSource } from "typeorm"
import express from "express";

const app = express();

const PORT = process.env.PORT ?? 8000
const DB_HOST = process.env.DB_HOST
const DB_PORT = Number(process.env.DB_PORT)
const DB_USERNAME = process.env.DB_USERNAME
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: DB_PORT,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    synchronize: true
})

AppDataSource.initialize()
    .then(() => {
        app.use(express.json()) // for parsing the req body

        app.listen(PORT, () => {
            console.log("listning on port:", PORT);
        })
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })