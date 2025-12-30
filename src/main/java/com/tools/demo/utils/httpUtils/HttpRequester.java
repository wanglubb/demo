package com.tools.demo.utils.httpUtils;

public interface HttpRequester {
    MyHttpResponse execute(MyHttpRequest request) throws Exception;
}