import { Bucket } from "@google-cloud/storage";
import { JSONValue } from "../../src/common/kacheryTypes/kacheryTypes";

const uploadJsonToBucket = (bucket: Bucket, objectName: string, x: JSONValue): Promise<void> => {
    return new Promise((resolve, reject) => {
        const blob = bucket.file(objectName);
        const blobStream = blob.createWriteStream();

        blobStream.on('error', err => {
            reject(err)
        });

        blobStream.on('finish', () => {
            resolve()
        })

        blobStream.end(JSON.stringify(x));
    })
}

export default uploadJsonToBucket