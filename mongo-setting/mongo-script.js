import { MongoClient } from "mongodb"
const db_name = "pixivWebCrawler"
const db_user = "pixivWebCrawlerUser"
const role_name = "myrole"
const mongo_db_str =`mongodb://127.0.0.1:27017`   // or other mongodb user with all privileges (root)
const mongo_db_client = new MongoClient(mongo_db_str, { monitorCommands: true ,maxPoolSize:1000});

const DB = mongo_db_client.db(db_name)
try {
  await DB.createCollection("pixivWorks")
} catch(error) {
  console.log(error)
}

try {
  await DB.command({createUser: db_user, pwd: "test", roles: []})
  await DB.command({
    createRole: role_name,
    privileges:[
        {
            resource: { db: db_name, collection: "pixivWorks" },
            actions: [ "insert", "find", "update", "delete"]
        }
    ],
    roles: []
  })

  await DB.command({
    grantRolesToUser:db_user,
    roles:[role_name]
  })
} catch(error) {
  console.log(error)
}

await DB.collection("pixivWorks").createIndex({illustId:1},{unique:true})
await DB.collection("pixivWorks").createIndex({tags:1})
await DB.collection("pixivWorks").createIndex({isDownloaded:1})
await mongo_db_client.close()


