package com.tools.demo.utils.httpUtils;

import java.nio.charset.StandardCharsets;
import java.util.Map;

public class MyHttpResponse {
    private int statusCode;
    private Map<String, String> headers;
    private byte[] body;

    public MyHttpResponse(int statusCode, Map<String, String> headers, byte[] body) {
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = body;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public Map<String, String> getHeaders() {
        return headers;
    }

    public byte[] getBody() {
        return body;
    }

    public String getContentBodyString() {
        return new String(body, StandardCharsets.UTF_8);

    }

    /**
     * 从set-cookie中取值，兼容大小写，由于保存响应头同名进行了合并，此处取值按照合并规则切割
     * 以确保能拿到对应的cookie
     * @param cookieName
     * @return
     */
    public String getCookie(String cookieName) {
        if (this.headers == null)
            return null;
        String setCookieHeader = null;
        if (this.headers.containsKey("set-cookie")) {
            setCookieHeader = this.headers.get("set-cookie");
        } else if (this.headers.containsKey("Set-Cookie")) {
            setCookieHeader = this.headers.get("Set-Cookie");
        }
        if (setCookieHeader == null || setCookieHeader.isEmpty())
            return null;
        String[] headerLines = setCookieHeader.split("\\n");
        for (String headerLine : headerLines) {
            if (headerLine == null || headerLine.isEmpty())
                continue;
            String[] parts = headerLine.split(";", 2);
            String first = parts[0].trim();
            String[] kv = first.split("=", 2);
            if (kv.length == 2 && kv[0].trim().equals(cookieName)) {
                return kv[1].trim();
            }
        }
        return null;
    }
}