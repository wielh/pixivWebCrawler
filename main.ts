import {pictureSearch} from './src/getPictureId.js'
import {pictureDownloader} from './src/imageDownloader.js'
import {mongooseConnect} from './src/config.js'
import mongoose from 'mongoose'

async function main() {
    console.log("=============== phare argument ===============")
    const args: string[] = process.argv;
    let userID:string = ""
    let cookieStr:string = ""
    let searchPictureId = false
    let downloadImages = false
    let maxDownloaded = Number.MAX_SAFE_INTEGER

    const helpString = 
        "--userid <string>: Input id of your pixiv account" + 
        "--cookie <string>: Input string of login cookie, It can be found in request header"
        "--search_id: flag that indicate search ids on your favorite list"
        "--download: flag that indicate download images"
        "--max_downloaded <int>: Download image only on first <int> ids on your favorite list"
    for(let i=2; i<args.length; i++) {
        if (args[i] == "--help") {
            console.log(helpString)
            return
        }

        if (args[i] == "--userid" && i< args.length-1) {
            i++
            userID = args[i]
        } else if (args[i] == "--cookie" && i< args.length-1) {
            i++
            cookieStr = args[i]
        } else if (args[i] == "--download") {
            downloadImages = true
        } else if (args[i] == "--search_id"){
            searchPictureId = true
        } else if (args[i] == "--max_downloaded") {
            i++
            let tmp = parseInt(args[i])
            maxDownloaded = (isNaN(tmp)) ? Number.MAX_SAFE_INTEGER: tmp
        }
    }

    await mongooseConnect()
    if (searchPictureId) {
        console.log("=============== collect illustId to mongodb ===============")
        let pic = new pictureSearch(userID, cookieStr)
        await pic.write()
    }

    if (downloadImages) {
        console.log("=============== download image by illustId in mongodb ===============")
        let pic2 = new pictureDownloader(userID, cookieStr, maxDownloaded)
        await pic2.downloadImages()
    }
    console.log("=============== Done ===============")
    await mongoose.disconnect()
}

await main()
