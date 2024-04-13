
import { Schema, Document, model} from 'mongoose';

class pixivWorksDocument extends Document{
    illustId: string
    title: string
    userId: string
    pageCount: number
    tags : string[]
    isUnlisted: boolean
    isMasked: boolean
    aiType: number
    isDownloaded: number
}

const pixivWorksSchema = new Schema({
    type : Number,
    startDate : Number,
    endDate :Number
},{
    versionKey: false, 
    strict: false
});

const pixivWorksModel = model<pixivWorksDocument>('pixivWorks', pixivWorksSchema, 'pixivWorks')

async function checkPictureInserted(illustId: string):Promise<boolean> {
    let activitys = await pixivWorksModel.findOne({illustId: illustId});
    return !(activitys == null);
}

export async function insertPictureInfoIfNotExist(illustId: string, title: string , 
    userId: string , tags : string[], isUnlisted: boolean, isMasked: boolean, aiType: number):Promise<void>{
    let exist = await checkPictureInserted(illustId)
    if(!exist) {
        await pixivWorksModel.create({
            illustId: illustId, title: title, userId: userId, tags:tags, isUnlisted:isUnlisted, 
            isMasked: isMasked, aiType:aiType, isDownloaded:0
        })
    }
}

export async function markDownloaded(illustId: string):Promise<void> {
    let exist = await checkPictureInserted(illustId)
    if(exist) {
        await pixivWorksModel.updateOne({illustId: illustId},{$set:{isDownloaded:1}})
    }
}

export async function getUndownloadImageNumber():Promise<number> {
    let count = await pixivWorksModel.countDocuments({isDownloaded:0})
    return count
}

export async function getIllustIds(skip:number, limit:number): Promise<string[]> {
    let answer:string[] = []
    let docs = await pixivWorksModel.find({}).skip(skip).limit(limit).exec()
    for (let doc of docs) {
        answer.push(doc.illustId)
    }
    return answer
}