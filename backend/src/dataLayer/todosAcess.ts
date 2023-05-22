import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class todosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) {
    }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Getting all todos item')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: process.env.TODOS_CREATED_AT_INDEX,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('Create new todo item')
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async deleteTodo(todoID: string, userId: string): Promise<void> {
        logger.info(`Delete ${todoID} item`)
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoID,
                userId: userId
            }
        }).promise();
        return;
    }

    async updateTodo(todoId: string, todo: TodoUpdate, userId: string): Promise<TodoUpdate> {
        logger.info(`Update ${todoId} item`)
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: { '#name': 'name' },
            ExpressionAttributeValues: {
                ':name': todo.name,
                ':dueDate': todo.dueDate,
                ':done': todo.done,
            }
        }).promise();
        return todo;
    }
    async updateURL(todoId: string, userId: string): Promise<string> {
        const url = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': url,
            }
        }).promise();
        return todoId;
    }
}