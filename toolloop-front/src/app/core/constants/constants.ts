export abstract class Constants {
    static readonly SESSION_TOKEN_NAME = 'tooloop_session_token';
    static readonly SESSION_COOKIE_EXPIRATION_DAYS: number = 1;
    static readonly TOOL_DESCRIPTION_MAX_LENGTH: number = 200;
    static readonly TOOL_DESCRIPTION_MIN_LENGTH: number = 5;
    static readonly TOOL_MAX_IMAGES: number = 5;
    static readonly weekdayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
}
