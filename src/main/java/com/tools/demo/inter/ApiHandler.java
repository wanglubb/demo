package com.tools.demo.inter;

import java.util.Map;

import com.tools.demo.vo.ApiResponse;

/**
 * API请求处理器接口
 */
public interface ApiHandler {

    String getApiMethodName();

    ApiResponse handle(Map<String, Object> params) throws Exception;

}
