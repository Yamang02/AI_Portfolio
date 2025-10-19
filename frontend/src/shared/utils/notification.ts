import { message } from 'antd';

/**
 * 성공 메시지를 표시합니다.
 */
export const showSuccessMessage = (content: string) => {
    message.success(content);
};

/**
 * 에러 메시지를 표시합니다.
 */
export const showErrorMessage = (content: string) => {
    message.error(content);
};

/**
 * 경고 메시지를 표시합니다.
 */
export const showWarningMessage = (content: string) => {
    message.warning(content);
};

/**
 * 정보 메시지를 표시합니다.
 */
export const showInfoMessage = (content: string) => {
    message.info(content);
};
