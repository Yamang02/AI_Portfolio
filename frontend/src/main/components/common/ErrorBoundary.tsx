import React, { Component, ReactNode } from 'react';
import { Result, Button } from 'antd';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * 에러 바운더리 컴포넌트
 * React 컴포넌트 트리에서 발생하는 JavaScript 에러를 캐치하고 처리합니다.
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <Result
                    status="error"
                    title="오류가 발생했습니다"
                    subTitle="예상치 못한 오류가 발생했습니다. 페이지를 새로고침해주세요."
                    extra={
                        <Button 
                            type="primary" 
                            onClick={() => window.location.reload()}
                        >
                            페이지 새로고침
                        </Button>
                    }
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
