
import {connect} from 'mongoose';

const mongoIP = "127.0.0.1"
const mongoUsername = 'pixivWebCrawlerUser';
const mongoPassword = 'test';

export async function mongooseConnect(){
    try {
        let mongoStr = `mongodb://${mongoUsername}:${mongoPassword}@${mongoIP}:27017`;
        await connect(mongoStr, { dbName: "pixivWebCrawler", readPreference: "secondaryPreferred", serverSelectionTimeoutMS: 2000, authSource: "pixivWebCrawler" });
    }
    catch (error) {
        console.error('Error connecting to MongoDB with host:', error);
    }
}
export const pixivSetting = {
    language: 'zh_tw',
    pixivVersion : '471f117fcde85f9ce382c9d945dc8dd854ff4358',
    pageSize : 100,
    generateInferer: (userID:string) => {
        return `https://www.pixiv.net/users/${userID}/bookmarks/artworks`
    },
    generateHeaders: (userID:string, cookieStr:string) =>{
        return {
            "Accept-Encoding": "gzip, deflate ,br, zstd",
            "Cookie": cookieStr,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "X-User-Id": userID,
            "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": pixivSetting.generateInferer(userID)
        }
    },
    generateUserFavoriteURL: (userID:string, page:number) => {
        page = page>0? Math.floor(page):0
        return `https://www.pixiv.net/ajax/user/${userID}/illusts/bookmarks?tag=&offset=${pixivSetting.pageSize*page}&limit=${pixivSetting.pageSize}&rest=show&lang=${pixivSetting.language}&version=${pixivSetting.pixivVersion}`
    },
    generateillustIDURL: (illustID:string) => {
        return `https://www.pixiv.net/ajax/illust/${illustID}/pages?lang=${pixivSetting.language}&version=${pixivSetting.pixivVersion}`
    }
}