package com.tools.demo.config;

import com.tools.demo.interceptor.LoginInterceptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web配置类
 * 用于配置跨域请求、静态资源处理和拦截器
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private LoginInterceptor loginInterceptor;

    /**
     * 配置跨域请求
     * 允许前端页面调用后端API
     */
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * 配置静态资源处理
     * 确保静态文件能够正确访问
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600);
    }

    /**
     * 配置拦截器
     * 添加登录拦截器来保护需要认证的页面
     */
    @Override
    public void addInterceptors(@NonNull InterceptorRegistry registry) {
        registry.addInterceptor(loginInterceptor)
                .addPathPatterns("/", "/index.html", "/router/**") // 拦截首页和API路由
                .excludePathPatterns(
                        "/auth/**", // 排除认证相关接口
                        "/login.html", // 排除旧登录页（会跳转到 Möbius）
                        "/mobius.html", // 排除当前登录页
                        "/css/**", // 排除CSS文件
                        "/js/**", // 排除JS文件
                        "/images/**", // 排除图片文件
                        "/favicon.ico", // 排除网站图标
                        "/router/toBJ" // 排除背景首页跳转接口
                );
    }
}