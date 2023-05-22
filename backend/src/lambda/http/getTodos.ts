import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getAllTodos as getTodosForUser } from '../../businessLayer/todos';
import { getUserId } from '../utils';

// TODO: Get all TODO items for a current user
export const handler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      // Write your code here
      const userId = getUserId(event);
      const todo = await getTodosForUser(userId);
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          items: todo
        })
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