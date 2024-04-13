import axios, {AxiosResponse} from 'axios';
import {insertPictureInfoIfNotExist} from "./dbStructure.js"
import {pixivSetting} from "./config.js"

export class pictureSearch {
    private userID: string
    private static pageSize: number = 100
    private headers:any

    constructor(userID: string, cookieStr:string) {
        this.userID = userID
        this.headers = pixivSetting.generateHeaders(userID, cookieStr)
    }

    private generateURL(page:number):string{
        return pixivSetting.generateUserFavoriteURL(this.userID, page)
    }

    async write() {
        let firstResponse: AxiosResponse<any, any>
        try {
            firstResponse = await axios.get(this.generateURL(0), { headers: this.headers });
        } catch (error) {
            console.log(`Get request from url ${this.generateURL(0)} failed, reason:${error}`)
            return
        }

        if(!checkKeyExist("body", "firstResponse.data", firstResponse.data)) {
            return
        }

        if(!checkKeyExist("total", "firstResponse.data.body", firstResponse.data.body)) {
            return
        }

        if (!checkParameterFormat("number","firstResponse.data.body.total",firstResponse.data.body.total)) {
            return
        }

        console.log("Get firstResponse successful")
        let total = Math.floor(firstResponse.data.body.total as number)
        if (total <= 0) {
            console.log("firstResponse.data.body.total<=0")
            return
        }

        let loopTimes = total / pictureSearch.pageSize + ((total% pictureSearch.pageSize ==0)? 0:1)
        for (let i=0;i<loopTimes;i++) {
            console.log(`==========Start to fetch illustIds ${i}th times==========`)
            await this.writeSingleTime(i)
        }
    }

    private async writeSingleTime(page:number) {
        let response: AxiosResponse<any, any>
        try {
            response = await axios.get(this.generateURL(page), {headers: this.headers})
        } catch (error) {
            console.log(`Get request from url ${this.generateURL(page)} failed, reason:${error}`)
            return
        }
        
        if(!checkKeyExist("body", "response.data", response.data)) {
            console.log("Body not exist, data:", response.data)
            return
        }
        
        if(!checkKeyExist("works", "response.data.body", response.data.body)) {
            console.log("Works not exist, data:", response.data.body)
            return
        }

        for (let work of response.data.body.works) {
            if(!(checkKeyExist("id", "response.data.body.works[i]", work))|| 
               !(checkKeyExist("title", "response.data.body.works[i]", work))|| 
               !(checkKeyExist("userId", "response.data.body.works[i]", work))|| 
               !(checkKeyExist("tags", "response.data.body.works[i]", work))|| 
               !(checkKeyExist("isUnlisted", "response.data.body.works[i]", work))|| 
               !(checkKeyExist("isMasked", "response.data.body.works[i]", work))|| 
               !(checkKeyExist("aiType", "response.data.body.works[i]", work))){
                console.log("Some required info not exist, data:", work)
                continue
            }

            if (!checkParameterFormat("string","response.data.body.works[i].illustId", work.id)) {
                continue
            }

            let illustId: string
            let title : string
            let userId: string
            let tags : string[]
            let isUnlisted : boolean
            let isMasked : boolean
            let aiType : number

            try {
                illustId = work.id as string
                title = work.illustId as string
                userId = work.userId as string
                tags = work.tags as string[]
                isUnlisted = work.isUnlisted as boolean
                isMasked = work.isMasked as boolean
                aiType = work.aiType as number
            } catch (error) {
               console.log("parse parameters error, data:", work)
               continue
            }   

            if (isMasked) {
                console.log(`picture ${illustId} is masked`)
                continue
            }

            await insertPictureInfoIfNotExist(illustId, title, userId, tags, isUnlisted, isMasked ,aiType)
        }
    }

}

function checkKeyExist(key:string, objectNmae:string, obj:object):boolean{
    if (!(key in obj)){
        //console.log(`pixiv ${objectNmae} has no key \"${key}\",data:`, obj)
        return false
    }
    return true
}

function checkParameterFormat(type:string, objectNmae:string, obj:object):boolean{
    let realType = typeof obj
    if (!(realType == type)){
        console.log(`pixiv ${objectNmae} is type \"${realType}\" , not type \"${type}\",data:`,obj)
        return false
    }
    return true
}


