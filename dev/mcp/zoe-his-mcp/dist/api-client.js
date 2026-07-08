/**
 * API 客户端 - 用于调用日志平台
 * 复用主项目的 api-client.ts 逻辑
 */
export class ApiClient {
    config;
    token;
    constructor(config) {
        this.config = config;
    }
    setToken(token) {
        this.token = token;
    }
    async getLogs(params) {
        const baseUrl = this.config.baseUrl.replace(/\/$/, '');
        const logPath = this.config.logPath || '/api/log/query';
        const url = `${baseUrl}${logPath}`;
        const headers = this.buildHeaders();
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(params),
            });
            if (!response.ok) {
                const errBody = await response.text().catch(() => '');
                let detail = errBody.slice(0, 500);
                try {
                    const parsed = JSON.parse(errBody);
                    detail = parsed.message || parsed.error || parsed.msg || detail;
                }
                catch {
                    /* keep text */
                }
                throw new Error(`HTTP error! status: ${response.status}${detail ? ` — ${detail}` : ''}`);
            }
            const data = await response.json();
            return this.parseResponse(data);
        }
        catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    buildUrl(params) {
        const baseUrl = this.config.baseUrl.replace(/\/$/, '');
        const logPath = this.config.logPath || '/api/log/query';
        const queryParams = new URLSearchParams();
        if (params.pageSize)
            queryParams.set('pageSize', params.pageSize);
        if (params.pageNum)
            queryParams.set('pageNum', params.pageNum);
        if (params.indexvalue)
            queryParams.set('indexvalue', params.indexvalue);
        if (params.logType)
            queryParams.set('logType', params.logType);
        if (params.serviceName)
            queryParams.set('serviceName', params.serviceName);
        if (params.traceId)
            queryParams.set('traceId', params.traceId);
        if (params.sqlId)
            queryParams.set('sqlId', params.sqlId);
        if (params.logLevel && params.logLevel.length > 0) {
            queryParams.set('logLevel', params.logLevel.join(','));
        }
        return `${baseUrl}${logPath}?${queryParams.toString()}`;
    }
    buildHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            if (this.config.authType === 'custom' && this.config.customHeaderName) {
                headers[this.config.customHeaderName] = this.token;
            }
            else {
                headers['Authorization'] = `Bearer ${this.token}`;
            }
        }
        return headers;
    }
    parseResponse(data) {
        // 适配不同的响应格式
        // 格式1: { data: { pageCount, mapList } }
        if (data.data?.mapList && Array.isArray(data.data.mapList)) {
            return {
                total: data.data.pageCount || data.data.mapList.length,
                logs: data.data.mapList,
            };
        }
        // 格式2: { data: { list } }
        if (data.data?.list && Array.isArray(data.data.list)) {
            return {
                total: data.data.total || data.data.list.length,
                logs: data.data.list,
            };
        }
        // 格式3: { data: [] }
        if (data.data && Array.isArray(data.data)) {
            return {
                total: data.total || data.data.length,
                logs: data.data,
            };
        }
        // 格式4: []
        if (Array.isArray(data)) {
            return {
                total: data.length,
                logs: data,
            };
        }
        return {
            total: 0,
            logs: [],
        };
    }
}
//# sourceMappingURL=api-client.js.map