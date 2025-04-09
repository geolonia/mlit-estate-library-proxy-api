#!/usr/bin/env ts-node

import * as AWS from 'aws-sdk';

// コマンドライン引数からパラメータ名と値を取得する
const parameterName = process.argv[2];
const parameterValue = process.argv[3];

if (!parameterName || !parameterValue) {
  console.error('Usage: ts-node store-parameter.ts <parameter-name> <parameter-value>');
  process.exit(1);
}

const ssm = new AWS.SSM({ region: 'us-east-1' });

async function storeParameter() {
  const params: AWS.SSM.PutParameterRequest = {
    Name: parameterName,
    Value: parameterValue,
    Overwrite: true, // 既にパラメータが存在する場合は上書き
    Type: 'String'
  };

  try {
    await ssm.putParameter(params).promise();
    console.log(`Parameter stored: ${parameterName} = ${parameterValue}`);
  } catch (error) {
    console.error('Error storing parameter:', error);
  }
}

storeParameter();
