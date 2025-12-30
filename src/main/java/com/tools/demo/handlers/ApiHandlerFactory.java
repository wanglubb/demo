package com.tools.demo.handlers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.tools.demo.inter.ApiHandler;

import org.springframework.stereotype.Component;

/**
 * API处理器工厂类，用于根据API方法名获取对应的处理器
 */
@Component
public class ApiHandlerFactory {

    private final Map<String, ApiHandler> handlers = new HashMap<>(); // 使用HashMap来存储API方法名与对应的处理器之间的映射关系

    /**
     * 构造函数，用于初始化API处理器工厂
     * 
     * @param apiHandlers API处理器列表，用于注册各种API方法处理器
     */
    public ApiHandlerFactory(List<ApiHandler> apiHandlers) {
        // 遍历传入的API处理器列表，将每个处理器注册到handlers映射中
        for (ApiHandler handler : apiHandlers) {
            handlers.put(handler.getApiMethodName(), handler); // 以API方法名为键，处理器对象为值，存入handlers映射中
        }
    }

    /**
     * 根据API方法名获取对应的处理器
     * 
     * @param apiMethodName API方法名称
     * @return 返回与API方法名对应的ApiHandler对象，如果不存在则返回null
     */
    public ApiHandler getHandler(String apiMethodName) {
        return handlers.get(apiMethodName); // 从handlers映射中获取指定API方法名对应的处理器
    }

}
