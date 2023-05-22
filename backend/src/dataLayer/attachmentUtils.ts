import * as AWS from 'aws-sdk'
import { String } from 'aws-sdk/clients/appstream';
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS);

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    constructor(
        private readonly S3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = Number(process.env.SIGNED_URL_EXPIRATION)) 
        {}

    getUploadUrl(todoId: string): String {
        return this.S3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
        });
    }

    async deleteObject(todoId: string): Promise<void> {
        await this.S3.deleteObject({
            Bucket: this.bucketName,
            Key: todoId
        }).promise();
        return;
    }
}