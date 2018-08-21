'use strict';

const aws = require('aws-sdk');
const postmark = require('postmark');
const qs = require('query-string');
const extend = require('lodash.assignin');
const isPlainObject = require('lodash.isplainobject');
import * as dynamoDbLib from "./libs/dynamodb-lib"

const templates = (applicant) => {
  return applicant ? 8040542 : 8040543;
}

class Service {
  constructor() {

  }

  prepEmail(person={}, toAddress='', applicant=false) {
    return {
      "From": "louis@persistolabs.com",
      "To": toAddress,
      "TemplateId": templates(applicant),
      "TemplateModel": {
        "name": person.name,
        "email": person.email,
        "budget": person.budget,
        "description": person.description
      }
    };
  }

  sendEmailBatch(messages) {
    console.log('Trying to send emails.');
    let client = new postmark.Client(process.env.POSTMARK_KEY);
    return new Promise((resolve, reject) => {
      client.sendEmailBatch(messages, (err, done) => {
        if (!err) {
          console.log('Successfully sent emails');
          return resolve(done);
        } else {
          return reject(err);
        }
      });
    })
  }

  uploadToS3(body={}, name) {
    console.log(body, name)
    if (!isPlainObject(body) || typeof name !=='string') {
      return Promise.reject("Invalid params sent to upload to S3");
    }
    let s3 = new aws.S3()

    console.log('Trying to upload to s3', body, name)
    return s3.putObject({
      Body: Buffer.from(JSON.stringify(body)),
      Bucket: process.env.EMAIL_BUCKET,
      Key: `${name}.json`
    }).promise();
  }
}

module.exports.post = (event, context, callback) => {
  console.log(event);
  let body = event && event['body'];
  let params = isPlainObject(body) ? body : qs.parse(body);
  let service = new Service();

  let name = params.name && params.name.split(/ '-/).join('') + '-' + new Date().getTime();

  const dynamoParams = {
    TableName: "persisto-leads",

    Item: {
      name: params.name,
      email: params.email,
      budget: params.budget,
      description: params.description,
      createdAt: new Date().getTime()
    }
  }

  let toSend = [
    { email: params.email, applicant: true },
    { email: 'louis@persistolabs.com' },
    { email: 'michael@persistolabs.com' }
  ].map((email, i) =>
    service.prepEmail(params, email.email, email.applicant ));

    console.log('Using Params: ', params);

    service.uploadToS3(params, name)
      .then(done => {
        console.log('Sending emails');
        return service.sendEmailBatch(toSend);
      }).then(async (sent) => {
        console.log('Success', sent)
        await dynamoDbLib.call("put", dynamoParams);
        callback(null, formatRedirectSuccess(params.Item));
      })
      .catch(err => {
        console.log('ERROR - ', err);
        return callback(formatErrorHelper(err.message));
      })
};

const formatSuccessHelper = (response) => {
  return {
    "statusCode": 200,
    "body": response
  }
}

const formatRedirectSuccess = (sent) => {
  console.log('redirecting: ', sent)
  return {
    statusCode: 302,
    body: "",
    headers: {
      "Location": "https://persistolabs.com"
    }
  }
}

const formatErrorHelper = (response) => {
  return {
    "statusCode": 500,
    "body": response
  }
}
