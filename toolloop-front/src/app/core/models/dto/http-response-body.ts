export interface HttpResponseBody<T = any> {
    data: T;
    message: string;
    code?: number;
}
