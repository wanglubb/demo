package com.tools.demo.utils.httpUtils;

import java.util.Map;

public class MyHttpRequest {
    // 请求方法，例如GET、POST等
    private String method;
    // 请求的URL
    private String url;
    // 请求头
    private Map<String, String> headers;
    // 请求体
    private byte[] body;

    // 修复构造方法，支持传入所有参数
    public MyHttpRequest(String method, String url, Map<String, String> headers, byte[] body) {
        this.method = method;
        this.url = url;
        this.headers = headers;
        this.body = body;
    }

    public String getMethod() {
        return method;
    }

    public String getUrl() {
        return url;
    }

    public Map<String, String> getHeaders() {
        return headers;
    }

    public byte[] getBody() {
        return body == null ? null : body.clone();
    }
}