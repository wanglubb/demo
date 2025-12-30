package com.tools.demo.utils.httpUtils.okhttp;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import com.tools.demo.utils.httpUtils.MyHttpRequest;
import com.tools.demo.utils.httpUtils.HttpRequester;
import com.tools.demo.utils.httpUtils.MyHttpResponse;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * OkHttpRequester 使用 OkHttp 库实现。
 */
public class OkHttpRequester implements HttpRequester {
    private final OkHttpClient client;

    public OkHttpRequester() {
        this.client = new OkHttpClient();
    }

    public OkHttpRequester(OkHttpClient client) {
        this.client = client;
    }

    @Override
    public MyHttpResponse execute(MyHttpRequest request) throws Exception {
        Request.Builder requestBuilder = new Request.Builder()
                .url(request.getUrl());

        // 设置请求方法
        String method = request.getMethod();
        RequestBody body = null;

        // 处理请求体
        if (request.getBody() != null && request.getBody().length > 0) {
            body = RequestBody.create(request.getBody());
        }

        // 根据HTTP方法设置请求
        switch (method.toUpperCase()) {
            case "GET":
                requestBuilder.get();
                break;
            case "POST":
                requestBuilder.post(body != null ? body : RequestBody.create("", null));
                break;
            case "PUT":
                requestBuilder.put(body != null ? body : RequestBody.create("", null));
                break;
            case "DELETE":
                requestBuilder.delete(body);
                break;
            case "HEAD":
                requestBuilder.head();
                break;
            case "PATCH":
                requestBuilder.patch(body != null ? body : RequestBody.create("", null));
                break;
            default:
                throw new IllegalArgumentException("Unsupported HTTP method: " + method);
        }

        // 设置请求头
        if (request.getHeaders() != null) {
            for (Map.Entry<String, String> header : request.getHeaders().entrySet()) {
                requestBuilder.addHeader(header.getKey(), header.getValue());
            }
        }

        // 执行请求
        try (Response response = client.newCall(requestBuilder.build()).execute()) {
            // 获取响应状态码
            int statusCode = response.code();

            // 获取响应头
            Map<String, String> responseHeaders = new HashMap<>();
            if (response.headers() != null) {
                for (String name : response.headers().names()) {
                    responseHeaders.put(name, response.headers().get(name));
                }
            }

            // 获取响应体
            byte[] responseBody = response.body() != null ? response.body().bytes() : new byte[0];

            return new MyHttpResponse(statusCode, responseHeaders, responseBody);
        } catch (IOException e) {
            throw new Exception("HTTP request failed", e);
        }
    }
}