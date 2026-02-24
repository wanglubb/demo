package com.tools.demo.utils.httpUtils.apache;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import com.tools.demo.utils.httpUtils.MyHttpRequest;
import com.tools.demo.utils.httpUtils.HttpRequester;
import com.tools.demo.utils.httpUtils.MyHttpResponse;

import org.apache.hc.client5.http.classic.methods.HttpDelete;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.classic.methods.HttpHead;
import org.apache.hc.client5.http.classic.methods.HttpPatch;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.classic.methods.HttpPut;
import org.apache.hc.client5.http.classic.methods.HttpUriRequestBase;
import org.apache.hc.client5.http.entity.EntityBuilder;
import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.ContentType;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.http.io.entity.ByteArrayEntity;
import org.apache.hc.core5.http.io.entity.EntityUtils;
import org.apache.hc.core5.http.io.entity.StringEntity;
import org.apache.hc.core5.http.message.BasicHeader;

/**
 * ApacheHttpRequester 使用 Apache HttpClient 5.5 库实现。
 */
public class ApacheHttpRequester implements HttpRequester {
    private final CloseableHttpClient httpClient;

    // 默认禁用重定向
    public ApacheHttpRequester() {
        this.httpClient = HttpClients.custom().disableRedirectHandling().build();
    }

    public ApacheHttpRequester(CloseableHttpClient httpClient) {
        this.httpClient = httpClient;
    }

    @Override
    public MyHttpResponse execute(MyHttpRequest request) throws Exception {
        // 根据HTTP方法创建相应的请求对象
        HttpUriRequestBase httpRequest = createHttpRequest(request.getMethod(), request.getUrl());

        // 设置请求头
        if (request.getHeaders() != null) {
            for (Map.Entry<String, String> header : request.getHeaders().entrySet()) {
                httpRequest.addHeader(new BasicHeader(header.getKey(), header.getValue()));
            }
        }

        // 设置请求体
        if (request.getBody() != null && request.getBody().length > 0) {
            HttpEntity entity = createEntityFromRequest(request);
            httpRequest.setEntity(entity);
        }

        MyHttpResponse response = httpClient.execute(httpRequest, apacheResponse -> {

            // 获取响应头信息，合并同名响应头，以免被覆盖
            Map<String, String> responseHeaders = new HashMap<>();
            Arrays.stream(apacheResponse.getHeaders()).forEach(header -> {
                String name = header.getName().toLowerCase();
                responseHeaders.merge(name, header.getValue(), (oldV, newV) -> oldV + "\n" + newV);
            });
            HttpEntity entity = apacheResponse.getEntity();
            byte[] responseBody = entity != null ? EntityUtils.toByteArray(entity) : new byte[0];
            return new MyHttpResponse(apacheResponse.getCode(), responseHeaders, responseBody);
        });

        return response;
    }

    /**
     * 根据请求内容和头部信息创建适当的实体
     */
    private HttpEntity createEntityFromRequest(MyHttpRequest request) {
        String contentType = "";
        if (request.getHeaders() != null) {
            contentType = request.getHeaders().getOrDefault("Content-Type", "").toLowerCase();
        }

        if (contentType.contains("application/x-www-form-urlencoded")) {
            // 处理URL编码的表单数据
            String bodyStr = new String(request.getBody());
            return new StringEntity(bodyStr, ContentType.APPLICATION_FORM_URLENCODED);
        } else if (contentType.contains("multipart/form-data")) {
            // 处理multipart表单数据
            String bodyStr = new String(request.getBody());
            ContentType parsedContentType = ContentType.parse(contentType);
            return new StringEntity(bodyStr, parsedContentType);
        } else {
            // 默认处理二进制数据
            return new ByteArrayEntity(request.getBody(), ContentType.parse(contentType));
        }
    }

    /**
     * 直接按 method/url/headers/body 发起请求，方便外部传入自定义 CloseableHttpClient（如禁用自动重定向）
     */
    public MyHttpResponse executeRequest(String method, String url, Map<String, String> headers, byte[] body)
            throws Exception {
        HttpUriRequestBase httpRequest = createHttpRequest(method, url);

        // 设置请求头
        if (headers != null) {
            for (Map.Entry<String, String> header : headers.entrySet()) {
                httpRequest.addHeader(new BasicHeader(header.getKey(), header.getValue()));
            }
        }

        // 设置请求体
        if (body != null && body.length > 0) {
            HttpEntity entity = EntityBuilder.create()
                    .setBinary(body)
                    .build();
            httpRequest.setEntity(entity);
        }

        MyHttpResponse response = httpClient.execute(httpRequest, apacheResponse -> {
            // 获取响应头
            Map<String, String> responseHeaders = new HashMap<>();
            Arrays.stream(apacheResponse.getHeaders()).forEach(header -> {
                responseHeaders.put(header.getName(), header.getValue());
            });
            HttpEntity entity = apacheResponse.getEntity();
            byte[] responseBody = entity != null ? EntityUtils.toByteArray(entity) : new byte[0];
            return new MyHttpResponse(apacheResponse.getCode(), responseHeaders, responseBody);
        });

        return response;
    }

    /**
     * 根据HTTP方法创建相应的请求对象
     */
    private HttpUriRequestBase createHttpRequest(String method, String url) {
        switch (method.toUpperCase()) {
            case "GET":
                return new HttpGet(url);
            case "POST":
                return new HttpPost(url);
            case "PUT":
                return new HttpPut(url);
            case "DELETE":
                return new HttpDelete(url);
            case "HEAD":
                return new HttpHead(url);
            case "PATCH":
                return new HttpPatch(url);
            default:
                throw new IllegalArgumentException("Unsupported HTTP method: " + method);
        }
    }
}