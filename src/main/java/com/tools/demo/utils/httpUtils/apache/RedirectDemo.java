package com.tools.demo.utils.httpUtils.apache;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;

import com.tools.demo.utils.httpUtils.MyHttpResponse;

/* AI生成 - 45行 */
public class RedirectDemo {

    public static void main(String[] args) throws Exception {
        String startUrl = "https://login.gjzwfw.gov.cn/tacs-uc/sso/loginTrust?backUrl=https://portal.bjt.beijing.gov.cn/p/nation/ticketCallback.html";

        // 禁用自动重定向，手动跟随
        CloseableHttpClient client = HttpClients.custom()
                .disableRedirectHandling()
                .build();

        ApacheHttpRequester requester = new ApacheHttpRequester(client);

        String currentUrl = startUrl;
        int maxRedirects = 10;
        String foundPubKey = null;

        for (int i = 0; i < maxRedirects; i++) {
            // 简单的浏览器 UA，防止被部分站点拒绝
            Map<String, String> headers = Map.of("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");

            MyHttpResponse resp = requester.executeRequest("GET", currentUrl, headers, null);
            int code = resp.getStatusCode();

            // 检查 Location header（大小写不敏感）
            String location = null;
            for (Map.Entry<String, String> e : resp.getHeaders().entrySet()) {
                if ("location".equalsIgnoreCase(e.getKey())) {
                    location = e.getValue();
                    break;
                }
            }

            // 如果有 Location，解析为绝对 URL 并尝试从中提取 pubKey
            if (location != null && !location.isEmpty()) {
                URI base = URI.create(currentUrl);
                URI resolved = base.resolve(location);
                String nextUrl = resolved.toString();

                // 检查 pubKey 参数
                String pk = getQueryParam(nextUrl, "pubKey");
                if (pk != null) {
                    foundPubKey = pk;
                    currentUrl = nextUrl;
                    System.out.println("Found pubKey in redirect URL: " + foundPubKey);
                    break;
                }

                // 否则继续跟随重定向
                currentUrl = nextUrl;
                continue;
            }

            // 无 Location 且 200（最终页面），也尝试从当前Url的查询中寻找 pubKey
            if (code == 200) {
                String pk = getQueryParam(currentUrl, "pubKey");
                if (pk != null) {
                    foundPubKey = pk;
                } else {
                    // 如果需要还可以在 body 中查找（示例不实现）
                }
                break;
            }

            // 若是其它 3xx 而没有 Location 或超出重定向次数，则停止
        }

        if (foundPubKey != null) {
            System.out.println("pubKey = " + foundPubKey);
        } else {
            System.out.println("pubKey 未找到，最终 URL: " + currentUrl);
        }
    }

    private static String getQueryParam(String url, String name) {
        try {
            URI uri = URI.create(url);
            String query = uri.getRawQuery();
            if (query == null)
                return null;
            for (String part : query.split("&")) {
                int idx = part.indexOf('=');
                if (idx > 0) {
                    String k = URLDecoder.decode(part.substring(0, idx), StandardCharsets.UTF_8);
                    if (k.equals(name)) {
                        return URLDecoder.decode(part.substring(idx + 1), StandardCharsets.UTF_8);
                    }
                } else {
                    String k = URLDecoder.decode(part, StandardCharsets.UTF_8);
                    if (k.equals(name))
                        return "";
                }
            }
        } catch (Exception e) {
            // ignore parsing errors
        }
        return null;
    }
}
// AI生成 - 45行
