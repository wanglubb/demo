package com.tools.demo.controller;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.tools.demo.exceptionHandlers.ApiException;
import com.tools.demo.handlers.ApiHandlerFactory;
import com.tools.demo.inter.ApiHandler;
import com.tools.demo.inter.imp.GetHomePageUrlForBJ;
import com.tools.demo.vo.ApiResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cn.hutool.json.JSONUtil;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * 统一API控制器类
 * 提供统一的API入口，处理各种API请求
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/router")
public class UnifiedApiController {

    // 日志记录器
    private static final Logger logger = LoggerFactory.getLogger(UnifiedApiController.class);

    // API处理器工厂，用于获取不同的API处理器
    private final ApiHandlerFactory apiHandlerFactory;

    // 注入 Spring 容器，用于在启动时扫描 ApiHandler 实现
    private final ApplicationContext applicationContext;

    // 缓存已注册的方法列表，供前端下拉使用
    private final List<String> registeredMethods = new ArrayList<>();

    private final GetHomePageUrlForBJ getHomePageUrlForBJ;

    /**
     * 初始化已注册的方法列表（应用启动时执行）
     */
    @PostConstruct
    public void initRegisteredMethods() throws Exception {
        try {
            Map<String, ApiHandler> handlerBeans = applicationContext.getBeansOfType(ApiHandler.class);
            for (Map.Entry<String, ApiHandler> entry : handlerBeans.entrySet()) {
                String beanName = entry.getKey();
                ApiHandler handler = entry.getValue();
                String methodName = null;

                // 优先尝试通过反射调用常见的命名方法来获取方法标识
                try {
                    Method m = handler.getClass().getMethod("getApiMethodName");
                    Object ret = m.invoke(handler);
                    if (ret != null)
                        methodName = ret.toString();
                } catch (Exception ignore) {
                }
                // 回退到 beanName 或类名
                if (methodName == null || methodName.trim().isEmpty()) {
                    methodName = beanName;
                }

                registeredMethods.add(methodName);
            }
            logger.info("Registered API methods initialized: {}", registeredMethods);
        } catch (Exception e) {
            logger.error("Failed to initialize registered methods", e);
            throw new ApiException(9999, "Failed to initialize registered methods");
        }
    }

    /**
     * 提供已注册方法的列表，供前端页面动态读取下拉选项
     *
     * @return ApiResponse 包含方法名称列表
     */
    @GetMapping("/methods")
    public ApiResponse getRegisteredMethods() {

        return ApiResponse.success(registeredMethods);
    }

    /**
     * 处理获取API版本的请求
     * 
     * @return 返回包含版本信息的ApiResponse对象
     */
    @GetMapping("/getVersion")
    public ApiResponse getVersion() {
        // 创建并返回一个包含"Version 1.0"的成功响应对象
        ApiResponse apiResponse = ApiResponse.success("Version 1.0");
        // 记录接收到API版本请求的日志信息
        logger.debug("获取心跳版本");
        return apiResponse;
    }

    /**
     * 处理开放API的请求接口
     * 
     * @param params 包含请求参数的Map，其中必须包含"method"键
     * @return ApiResponse 返回API响应结果
     */
    @PostMapping("/open")
    public ApiResponse createRequest(@RequestBody Map<String, Object> params) {
        // 检查参数是否为空或缺少method参数
        if (params == null || !params.containsKey("method")) {
            return ApiResponse.error(400, "Missing 'method' parameter");
        }
        // 从参数中获取method值
        String method = (String) params.get("method");
        // 处理具体的业务逻辑
        try {
            // 根据method获取对应的处理器
            ApiHandler handler = apiHandlerFactory.getHandler(method);
            // 如果处理器不存在，返回404错误
            if (handler == null) {
                return ApiResponse.error(404, "API method not found");
            }

            Object paramsObj = params.get("params");
            if (!(paramsObj instanceof Map)) {
                throw new ApiException(9999, "Invalid params format");
            }
            @SuppressWarnings("unchecked")
            Map<String, Object> details = (Map<String, Object>) paramsObj;

            // 调用处理器处理请求并返回结果
            return handler.handle(details);
        } catch (ApiException e) {
            logger.error("Error processing API request", e.getMessage());
            // 返回500服务器内部错误
            return ApiResponse.error(e.getCode(), e.getMessage());
        } catch (Exception e) {
            // 打印异常堆栈信息
            logger.error("Error processing API request", e);
            // 返回500服务器内部错误
            return ApiResponse.error(500, "Internal Server Error");
        }
    }

    /**
     * 一键跳转到北京工商局首页
     * 
     * @param response
     * @throws Exception
     */
    @GetMapping("/toBJ")
    public void RedirectBeiJingHomePage(HttpServletResponse response) throws Exception {
        // 构造入参，写死一个账号登录
        HashMap<String, Object> userinfo = new HashMap<>();
        userinfo.put("password", "Aa13536022721");
        userinfo.put("username", "13660102924");
        String homePageUrl = null;
        try {
            ApiResponse handle = getHomePageUrlForBJ.handle(userinfo);
            homePageUrl = JSONUtil.parseObj(handle.getData()).getStr("homePageUrl");
        } catch (ApiException e) {
            logger.error("获取连接异常：" + e);
        }

        if (homePageUrl != null && !homePageUrl.isBlank()) {
            response.sendRedirect(homePageUrl);
        } else {
            response.sendError(HttpServletResponse.SC_BAD_GATEWAY, "无法获取重定向地址");
        }
    }

}
