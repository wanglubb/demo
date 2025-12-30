package com.tools.demo.utils.httpUtils;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;

import com.tools.demo.utils.httpUtils.apache.ApacheHttpRequester;
import com.tools.demo.utils.httpUtils.okhttp.OkHttpRequester;

public class MyHttpClientFactory {
    private static final Map<String, Supplier<HttpRequester>> registry = new ConcurrentHashMap<>();

    static {
        // 内置实现注册
        registry.put("apache", (Supplier<HttpRequester>) () -> new ApacheHttpRequester());
        registry.put("okhttp", (Supplier<HttpRequester>) () -> new OkHttpRequester());
    }

    // 获取实现（按 key, 如 "apache" 或 "okhttp"）
    public static HttpRequester get(String key) {
        Supplier<HttpRequester> s = registry.get(key.toLowerCase());
        if (s == null)
            throw new IllegalArgumentException("No HttpRequester registered for key: " + key);
        return s.get();
    }

    // 注册自定义实现
    public static void register(String key, Supplier<HttpRequester> supplier) {
        registry.put(key.toLowerCase(), supplier);
    }
}