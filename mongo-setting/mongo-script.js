import { MongoClient } from "mongodb"
const db_name = "pixivWebCrawler"
const db_user = "pixivWebCrawlerUser"
const role_name = "myrole"
const mongo_db_str =`mongodb://admin:admin@127.0.0.1:27017`   // or other mongodb user with all privileges (root)
const mongo_db_client = new MongoClient(mongo_db_str, { monitorCommands: true ,maxPoolSize:1000});

const DB = mongo_db_client.db(db_name)
try {
  await DB.createCollection("pixivWorks")
  console.log("create db and collection successfully")
} catch(error) {
  console.log(error)
}

try {
  await DB.command({
    createRole: role_name,
    privileges:[
        {
            resource: { db: db_name, collection: "pixivWorks" },
            actions: [ "insert", "find", "update", "remove"]
        }
    ],
    roles: []
  })
  await DB.command({createUser: db_user, pwd: "test", roles: [{ role: role_name, db: 'pixivWebCrawler' }]})
  console.log("create role successfully")
  await DB.command({
    grantRolesToUser:db_user,
    roles:[role_name]
  })
  console.log("create user successfully")
} catch(error) {
  console.log(error)
}

await DB.collection("pixivWorks").createIndex({illustId:1},{unique:true})
await DB.collection("pixivWorks").createIndex({tags:1})
await DB.collection("pixivWorks").createIndex({isDownloaded:1})
console.log("create index successfully")
await mongo_db_client.close()


