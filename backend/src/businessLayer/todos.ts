import { todosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../dataLayer/attachmentUtils';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const todoAccess = new todosAccess();
const attachmentUtil = new AttachmentUtils();
const logger = createLogger('Todos');

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    return await todoAccess.getAllTodos(userId);
}

export async function createTodo(userId: string, todo: CreateTodoRequest): Promise<TodoItem> {
    logger.info("Start create todo item");
    const todoId = uuid.v4()
    const todoParams: TodoItem = {
        ...todo,
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null
    }
    const todoItem = await todoAccess.createTodo(todoParams);
    logger.info('Completed create!');
    return todoItem;
}

export async function updateTodo(todoId: string, todo: UpdateTodoRequest, userId: string): Promise<UpdateTodoRequest> {
    const todoUpdatedItem = await todoAccess.updateTodo(todoId, todo, userId);
    logger.info('Completed update!');
    return todoUpdatedItem;
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    await todoAccess.deleteTodo(todoId, userId);
    logger.info('Completed delete!');
    return;
}

export async function getSignedUrl(todoId: string, userId: string): Promise<string> {
    await todoAccess.updateURL(todoId, userId);
    return attachmentUtil.getUploadUrl(todoId);
}

export async function deleteBucketObject(todoId: string): Promise<void> {
    return await attachmentUtil.deleteObject(todoId);
}