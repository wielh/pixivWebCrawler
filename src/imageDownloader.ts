import axios,{AxiosResponse} from 'axios';
import {createWriteStream} from 'fs';
import { pixivSetting } from './config.js'
import { markDownloaded, getUndownloadImageNumber, getIllustIds} from './dbStructure.js'
import { join } from 'path';

class ImageResponse {
    error :boolean
    message :string
    body :ImageURLResponse[]
}   

class ImageURLResponse {
    width: number
    heigth: number
    urls : {
        thumb_mini: string
        small: string
        regular: string
        original: string
    }
}

export class pictureDownloader {
    private headers: any
    private static pageSize: number = 100
    maxDownloaded: number

    constructor(userID: string, cookieStr:string  ,maxDownloaded: number) {
        this.headers = pixivSetting.generateHeaders(userID, cookieStr)
        this.maxDownloaded = maxDownloaded>=0? maxDownloaded:0
    }

    async downloadImages() {
        let count = await getUndownloadImageNumber()
        count = Math.min(this.maxDownloaded, count)
        count = Math.floor(count)

        let pagesSize:number[] = [] 
        for (let i=0; i<Math.floor(count / pictureDownloader.pageSize) ;i++) {
            pagesSize.push(pictureDownloader.pageSize)
        }
        if (count % pictureDownloader.pageSize != 0) {
            pagesSize.push(count % pictureDownloader.pageSize)
        }
        console.log("pagesSize:", pagesSize)
        
        let index = 0
        for (let pageSize of pagesSize) {
            let ids:string[] = await getIllustIds(index*pictureDownloader.pageSize, pageSize) 
            for (let id of ids) {
                await this.downloadImagesById(id)
            }
            index ++ 
        }
    }

    private async downloadImagesById(illustId:string): Promise<void> {
        let url =  pixivSetting.generateillustIDURL(illustId)
        let response: AxiosResponse<any, any>
        try {
            response = await axios.get(url, { headers: this.headers });
        } catch (error) {
            console.log(`Get request from url ${url} failed, ${error}`)
            return
        }
        
        let data: ImageResponse
        try {
            data = response.data as ImageResponse
            if ( data.error == undefined || data.message==undefined || data.body == undefined || data.body.length <=0 ) {
                console.log("The format of response is incorrect, data:", data)
                return
            }
        } catch (error) {
            console.log("The format of response is incorrect, data:")
            return
        }

        for (let urlData of data.body) {
            this.downloadSingalImage(urlData.urls.regular).catch (
                (error) => { console.log(`Some error happens while downloading image ${urlData.urls.regular}, reason: ${error}`) }
            )
        }
        await markDownloaded(illustId)
    }

    private async downloadSingalImage(imageUrl: string): Promise<void> {
        let destination = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        destination = join("image",destination)
        const response = await axios.get(imageUrl, { responseType: 'stream', headers: this.headers });
        const writer = createWriteStream(destination);
        response.data.pipe(writer);
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    }
}
