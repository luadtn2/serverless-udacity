import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { deleteTodo, deleteBucketObject } from '../../businessLayer/todos'
import { getUserId } from '../utils';


export const handler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const todoId = event.pathParameters.todoId
      // TODO: Remove a TODO item by id
      const userId = getUserId(event);
      await Promise.all([
        deleteTodo(todoId, userId),
        deleteBucketObject(todoId)
      ]);
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: ''
      }
    } catch (e) {
      let message: string;
      if (typeof e === "string") {
        message = e.toUpperCase() // works, `e` narrowed to string
      } else if (e instanceof Error) {
        message = e.message // works, `e` narrowed to Error
      }
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: message
        })
      }
    }
  }
