package com.tools.demo.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 登录拦截器
 * 用于检查用户是否已登录，未登录用户将被重定向到登录页面
 */
@Component
public class LoginInterceptor implements HandlerInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(LoginInterceptor.class);

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull Object handler) throws Exception {
        String requestURI = request.getRequestURI();
        logger.debug("拦截请求: {}", requestURI);

        // 获取session
        HttpSession session = request.getSession(false);

        // 检查用户是否已登录
        if (session != null && session.getAttribute("user") != null) {
            logger.debug("用户已登录: {}", session.getAttribute("user"));
            return true; // 已登录，允许访问
        }

        // 如果是AJAX请求或API请求，返回JSON错误信息
        if (isAjaxRequest(request)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"code\":401,\"message\":\"未登录，请先登录\",\"data\":null}");
            return false;
        }

        // 普通页面请求，重定向到登录页面
        logger.info("用户未登录，重定向到登录页面");
        response.sendRedirect("/mobius.html");
        return false;
    }

    /**
     * 判断是否为AJAX请求
     */
    private boolean isAjaxRequest(HttpServletRequest request) {
        String xRequestedWith = request.getHeader("X-Requested-With");
        String contentType = request.getHeader("Content-Type");
        String accept = request.getHeader("Accept");

        return "XMLHttpRequest".equals(xRequestedWith) ||
                (contentType != null && contentType.contains("application/json")) ||
                (accept != null && accept.contains("application/json"));
    }
}