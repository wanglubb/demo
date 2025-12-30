# Demo API 项目

这是一个Spring Boot项目，提供了统一的API接口和前端测试页面。

## 功能特性

- 统一的API路由器 (`/router`)
- 支持多种API方法的动态调用
- 内置前端测试界面
- 用户登录认证系统
- Session会话管理

## API接口

### 认证相关接口

#### 1. 用户登录
- **URL**: `POST /auth/login`
- **描述**: 用户登录接口
- **请求参数**:
```json
{
  "username": "admin",
  "password": "123456"
}
```
- **响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "登录成功"
}
```

#### 2. 用户登出
- **URL**: `POST /auth/logout`
- **描述**: 用户登出接口
- **响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "登出成功"
}
```

#### 3. 检查登录状态
- **URL**: `GET /auth/status`
- **描述**: 检查当前用户登录状态
- **响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "isLoggedIn": true,
    "username": "admin",
    "loginTime": 1694423456789
  }
}
```

### 业务接口（需要登录）

#### 1. 获取版本信息
- **URL**: `GET /router/getVersion`
- **描述**: 获取API版本信息
- **响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "Version 1.0"
}
```

#### 2. 开放接口
- **URL**: `POST /router/open`
- **描述**: 统一的API调用入口
- **请求参数**:
```json
{
  "method": "createOrder",
  "params": {
    "orderId": "ORDER_001",
    "amount": 100.00,
    "productName": "测试商品"
  }
}
```
- **响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": "Order ORDER_001 created successfully"
}
```

## 支持的API方法

- `createOrder`: 创建订单

## 快速开始

### 1. 启动项目
```bash
# 使用Gradle启动
./gradlew bootRun

# 或者使用IDE直接运行DemoApplication.java
```

### 2. 访问登录页面
项目启动后，在浏览器中访问：
```
http://localhost:8080/login.html
```

### 3. 登录系统
使用默认账号登录：
- **用户名**: admin
- **密码**: 123456

### 4. 使用前端测试工具
登录成功后会自动跳转到API测试页面：
```
http://localhost:8080
```
- 点击"获取版本"按钮测试版本接口
- 在"开放接口调用"部分：
  - 选择或输入API方法名
  - 编辑JSON参数
  - 点击"调用接口"按钮
- 点击右上角"登出"按钮退出系统

## 项目结构

```
src/
├── main/
│   ├── java/com/tools/demo/
│   │   ├── DemoApplication.java          # 主启动类
│   │   ├── config/
│   │   │   └── WebConfig.java            # Web配置（CORS、静态资源、拦截器）
│   │   ├── controller/
│   │   │   ├── AuthController.java       # 认证控制器
│   │   │   └── UnifiedApiController.java # 统一API控制器
│   │   ├── handlers/
│   │   │   └── ApiHandlerFactory.java    # API处理器工厂
│   │   ├── interceptor/
│   │   │   └── LoginInterceptor.java     # 登录拦截器
│   │   ├── inter/
│   │   │   ├── ApiHandler.java           # API处理器接口
│   │   │   └── imp/
│   │   │       └── CreateOrderHandler.java # 创建订单处理器
│   │   └── vo/
│   │       └── ApiResponse.java          # API响应对象
│   └── resources/
│       ├── static/
│       │   ├── index.html                # 前端测试页面（需要登录）
│       │   └── login.html                # 登录页面
│       └── application.properties        # 应用配置
```

## 技术栈

- **后端**: Spring Boot 4.0, Java 17
- **前端**: HTML5, CSS3, JavaScript (原生)
- **构建工具**: Gradle
- **日志**: Log4j2

## 开发说明

### 添加新的API方法
1. 创建新的Handler类实现`ApiHandler`接口
2. 使用`@Service`注解标注
3. 实现`getApiMethodName()`和`handle()`方法
4. Spring会自动注册到`ApiHandlerFactory`中

### 前端调用示例
```javascript
// 调用开放接口
const response = await fetch('/router/open', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        method: 'createOrder',
        params: {
            orderId: 'ORDER_001',
            amount: 100.00
        }
    })
});
const data = await response.json();
```

## 注意事项

- 项目默认运行在8080端口
- 首页和API接口需要登录后才能访问
- 默认登录账号：admin / 123456
- Session超时时间为30分钟
- 前端页面支持现代浏览器
- 开发时可以使用浏览器开发者工具查看网络请求

## 安全说明

- 当前使用的是简单的用户名密码验证
- 生产环境建议：
  - 使用数据库存储用户信息
  - 密码加密存储
  - 添加验证码防止暴力破解
  - 使用HTTPS协议
  - 配置更强的Session安全策略