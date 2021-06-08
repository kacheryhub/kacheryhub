import { GetSignedUrlConfig, Storage } from '@google-cloud/storage'
import { ByteCount, urlString, UrlString } from "../../src/common/types/kacheryTypes"

const generateV4UploadSignedUrl = async (storage: Storage, bucketName: string, fileName: string, size: ByteCount | null): Promise<UrlString> => {
    // These options will allow temporary uploading of the file with outgoing
    // Content-Type: application/octet-stream header.
    const options: GetSignedUrlConfig = {
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: 'application/octet-stream',
      extensionHeaders: {
        //   'X-Upload-Content-Length': Number(size)
      }
    };
  
    // Get a v4 signed URL for uploading file
    const [url] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getSignedUrl(options)
    
    return urlString(url)
  
    // console.log('Generated PUT signed URL:');
    // console.log(url);
    // console.log('You can use this URL with any user agent, for example:');
    // console.log(
    //   "curl -X PUT -H 'Content-Type: application/octet-stream' " +
    //     `--upload-file my-file '${url}'`
    // );
}

export default generateV4UploadSignedUrl