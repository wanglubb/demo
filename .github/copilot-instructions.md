# Copilot 使用说明（项目专用）

目的：帮助 AI 编码代理快速在此仓库里做出正确、可编译、风格一致的改动。

要点摘要
- 项目类型：Spring Boot 应用（Java 17，Spring Boot 4），构建用 Gradle。
- 启动入口：`com.tools.demo.DemoApplication`（文件：src/main/java/com/tools/demo/DemoApplication.java）。
- 常用命令：`./gradlew bootRun` 启动，`./gradlew test` 运行测试，Windows 下用 `gradlew.bat`。

架构与数据流（必读）
- 前端静态页面放在 `src/main/resources/static`（`login.html`, `index.html`）。
- 认证：`/auth/*` 由 `AuthController` 处理（src/main/java/com/tools/demo/controller/AuthController.java），使用 HTTP session（session key: `user`）。
- 统一 API：所有开放业务接口通过 `/router` 路由，入口为 `UnifiedApiController`（src/main/java/com/tools/demo/controller/UnifiedApiController.java）。
- 插件式业务处理器：业务实现遵循 `com.tools.demo.inter.ApiHandler` 接口（src/main/java/com/tools/demo/inter/ApiHandler.java），由 `ApiHandlerFactory`（src/main/java/com/tools/demo/handlers/ApiHandlerFactory.java）通过构造函数注入的 `List<ApiHandler>` 注册。
  - 也就是说：新增 API 只需编写实现 `ApiHandler` 的 `@Service` Bean，`getApiMethodName()` 返回方法名（如 `createOrder`），`handle(Map)` 执行业务并返回 `ApiResponse`。

关键实现/约定（从源码可验证）
- ApiHandler 接口签名：`String getApiMethodName()` 和 `ApiResponse handle(Map<String,Object> params)`。例：`CreateOrderHandler`（src/main/java/com/tools/demo/inter/imp/CreateOrderHandler.java）。
- Api 调用约定：前端发送 `{ "method": "name", "params": {...} }` 到 `/router/open`，控制器会通过 `ApiHandlerFactory.getHandler(method)` 查找处理器并调用。
- 统一响应对象：`com.tools.demo.vo.ApiResponse`（遵循 `.success(...)` / `.error(...)` 工厂方法）。
- 异常处理：自定义 `ApiException`（见 exceptionHandlers），`UnifiedApiController` 捕获并返回错误码/信息。

Web 配置与拦截器
- 静态资源与 CORS：由 `WebConfig` 配置（src/main/java/com/tools/demo/config/WebConfig.java），注意 `addResourceHandlers` 和 `addCorsMappings`。
- 登录拦截器：`LoginInterceptor`（src/main/java/com/tools/demo/interceptor/LoginInterceptor.java）保护 `/router/**` 和首页，未登录的 AJAX 请求返回 401 JSON，普通页面重定向到 `/login.html`。

工程与运行注意事项
- Java 版本：17（请确保本地 JDK 匹配）。
- Gradle wrapper 在仓库根目录，可用 `./gradlew` 或 Windows `gradlew.bat`。
- IDE 调试：.vscode/launch.json 已配置 `mainClass` 为 `com.tools.demo.DemoApplication`。

AI 代理编码规范（必须遵守的项目特性）
- 生成代码注释约束：仓库内存在 `.github/prompts/demo.prompt.md`，要求“每次 AI 生成的代码开头和结尾都要有注释，结尾是 "// AI生成 - xx行"，开头是 "/* AI生成 - xx行 */"”。任何自动生成/插入的源文件请遵守此约定。
- 新增 `ApiHandler`：
  1. 放在 `src/main/java/com/tools/demo/inter/imp/`，类上加 `@Service`。
  2. `getApiMethodName()` 返回唯一方法名（与前端下拉值一致）。
  3. `handle(Map<String,Object> params)` 必须对 `params.get("params")` 做类型校验并抛出 `ApiException`（错误码和信息）。
  4. 使用 `ApiResponse.success(...)` / `ApiResponse.error(...)` 返回结果。
- 配置/拦截器变更：如果改动涉及拦截路径或静态资源，请同时更新 `WebConfig`；若引入新静态资源，放到 `src/main/resources/static`。
- 第三方库：代码中使用 `cn.hutool` 的工具类（例如 `MapUtil`），如需引入新库，更新 `build.gradle` 并确保 Gradle wrapper 可编译。

示例：新增 API 处理（最小可工作示例）
1) 新文件 `src/main/java/com/tools/demo/inter/imp/ExampleHandler.java`：实现 `ApiHandler` 并加 `@Service`。
2) 返回的 `getApiMethodName()` 返回 `"exampleMethod"`。
3) 前端调用：POST `/router/open`，body: `{ "method":"exampleMethod", "params":{...} }`。

要点汇总（供快速参考）
- 主类：`src/main/java/com/tools/demo/DemoApplication.java`
- 认证控制器：`src/main/java/com/tools/demo/controller/AuthController.java`
- 统一路由：`src/main/java/com/tools/demo/controller/UnifiedApiController.java`
- 处理器接口：`src/main/java/com/tools/demo/inter/ApiHandler.java`
- 处理器工厂：`src/main/java/com/tools/demo/handlers/ApiHandlerFactory.java`
- 拦截器/配置：`src/main/java/com/tools/demo/interceptor/LoginInterceptor.java`, `src/main/java/com/tools/demo/config/WebConfig.java`
- AI 代码 注释 约束文件：`.github/prompts/demo.prompt.md`

如果某部分不明确或需要把指南扩展为更详细的约定（代码格式、提交信息、测试要求等），请指出我将迭代更新本文件。
