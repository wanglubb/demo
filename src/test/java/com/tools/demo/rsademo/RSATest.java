/* AI生成 - 20行 */
package com.tools.demo.rsademo;

import com.fasterxml.jackson.databind.ObjectMapper;
import javax.crypto.Cipher;

import java.io.ByteArrayOutputStream;
import java.security.KeyFactory;
import java.security.MessageDigest;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.security.interfaces.RSAPublicKey;

public class RSATest {

    /**
     * 使用 RSA 公钥对数据进行加密,公钥不能写死，需要分析请求头中的公钥
     */
    private static final String PUBLIC_KEY = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQD1ji0/PfPZ1qriu9ygPgfOS4YtF7/ktdB78mM1A3Uw/cOEZUrX6gHquWZLpp/aP1I98ORSVKcilvY2FrCNkDxzbeFNwaVoP5NySqOViJbMPYdqE8dk5FuXe0W+sy11CLBRfVreapMHy86cUtVTA+HZbg4NntHBLa/Ev9omx1NS5wIDAQAB";

    public static void main(String[] args) throws Exception {

        String username = "13660102924";
        String password = "Aa13536022721";

        String md5Pwd = md5Hex(password);
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("userIdentity", username);
        payload.put("resetFlag", false);// 固定为false,否则会要求重设密码
        payload.put("encryptedPwd", md5Pwd);

        ObjectMapper om = new ObjectMapper();
        String json = om.writeValueAsString(payload);

        // 使用新的 Unicode-aware 分片加密实现，尽量与 js 的 encryptUnicodeLong 保持一致
        String encryptData = rsaEncryptUnicodeLongExactJS(PUBLIC_KEY, json);
        System.out.println("账密RSA加密结果：" + encryptData);
    }

    public static String md5Hex(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] digest = md.digest(input.getBytes("UTF-8"));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) {
            sb.append(String.format("%02x", b & 0xff));
        }
        return sb.toString();
    }

    public static PublicKey getPublicKeyFromBase64(String publicKeyBase64) throws Exception {
        // 支持两种输入：带 PEM 包裹的字符串 或 纯 base64 内容（PUBLIC_KEY 已为 base64）
        String b64 = publicKeyBase64 == null ? "" : publicKeyBase64.trim();
        if (b64.startsWith("-----BEGIN")) {
            // 去掉 PEM 头尾并去除所有空白
            b64 = b64.replaceAll("-----BEGIN [^-]+-----", "")
                    .replaceAll("-----END [^-]+-----", "")
                    .replaceAll("\\s+", "");
        }
        byte[] keyBytes = Base64.getDecoder().decode(b64);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
        KeyFactory kf = KeyFactory.getInstance("RSA");
        return kf.generatePublic(spec);
    }

    // 等价于 js 文件中 a(hex) 的实现：以每 3 个 hex 位为一组转换为 base64 字符，处理余数并在 末尾补 '=' 到 4 的倍数
    private static String hexToBase64JS(String hex) {
        final String I = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        final String N = "=";
        StringBuilder r = new StringBuilder();
        int e = 0;
        for (; e + 3 <= hex.length(); e += 3) {
            int val = Integer.parseInt(hex.substring(e, e + 3), 16);
            r.append(I.charAt(val >> 6));
            r.append(I.charAt(val & 63));
        }
        if (e + 1 == hex.length()) {
            int val = Integer.parseInt(hex.substring(e, e + 1), 16);
            r.append(I.charAt(val << 2));
        } else if (e + 2 == hex.length()) {
            int val = Integer.parseInt(hex.substring(e, e + 2), 16);
            r.append(I.charAt(val >> 2));
            r.append(I.charAt((3 & val) << 4));
        }
        while ((r.length() & 3) > 0) {
            r.append(N);
        }
        return r.toString();
    }

    // 新增：按 JS t.prototype.encryptUnicodeLong 完整复现（分片策略、JS 风格的 char->bytes 编码，以及块密文
    // hex 拼接与 a(hex) 转 base64）
    public static String rsaEncryptUnicodeLongExactJS(String publicKeyBase64, String plain) throws Exception {
        PublicKey publicKey = getPublicKeyFromBase64(publicKeyBase64);

        // System.out.println("JAVA pubKey(base64): " +
        // Base64.getEncoder().encodeToString(publicKey.getEncoded()));
        Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);

        int keyByteSize = (((RSAPublicKey) publicKey).getModulus().bitLength() + 7) / 8;
        int maxBlock = keyByteSize - 11; // JS: (e.n.bitLength()+7>>3)-11

        StringBuilder n = new StringBuilder(); // 累积每块 encrypt 返回的 hex（JS 中变量 n）
        int s = 0, o = 0, h = 0, u = 0;
        int c = plain.length();
        for (int f = 0; f < c; f++) {
            int l = plain.charAt(f); // 与 JS charCodeAt 等价（UTF-16 单元）
            int add = (l <= 127) ? 1 : (l <= 2047) ? 2 : (l <= 65535) ? 3 : 4;
            h += add;
            if (h > maxBlock) {
                String r = plain.substring(s, o);
                n.append(encryptChunkToHex(cipher, r)); // e.encrypt(r) 的 hex 等价
                s = o;
                h -= u;
            } else {
                o = f + 1; // JS 中 o = f，但 substring(s,o) 采用 [s,o) 效果需 o=f+1
                u = h;
            }
        }
        // 追加剩余片段
        if (s < c) {
            String r = plain.substring(s, c);
            n.append(encryptChunkToHex(cipher, r));
        }
        // 用 JS 中的 a(hex) 等价函数转为 Base64
        return hexToBase64JS(n.toString());
    }

    // 将子串按 JS 的 w() 中对字符到字节的映射编码（按 UTF-16 单元逐 char 处理：<128:1字节; <=2047:2字节;
    // else:3字节）
    private static byte[] jsEncodeString(String s) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        for (int i = 0; i < s.length(); i++) {
            int ch = s.charAt(i);
            if (ch < 128) {
                out.write(ch);
            } else if (ch < 2048) {
                out.write((ch >> 6) | 192);
                out.write((ch & 63) | 128);
            } else {
                out.write((ch >> 12) | 224);
                out.write(((ch >> 6) & 63) | 128);
                out.write((ch & 63) | 128);
            }
        }
        return out.toByteArray();
    }

    // 对单个片段进行 RSA 加密，并返回与 JS e.encrypt(r) 等价的 hex
    // 表示（BigInteger(1,bytes).toString(16)，若奇数长度前置 0）
    private static String encryptChunkToHex(Cipher cipher, String chunk) throws Exception {
        byte[] plainBytes = jsEncodeString(chunk); // 使用 JS 风格的编码
        byte[] encrypted = cipher.doFinal(plainBytes); // Java Cipher 执行 RSA/ECB/PKCS1Padding
        // 转为与 JS 中 i.toString(16) 等价的 hex：去掉前导零，但保持偶数长度
        java.math.BigInteger bi = new java.math.BigInteger(1, encrypted);
        String hex = bi.toString(16);
        if ((hex.length() & 1) == 1) {
            hex = "0" + hex;
        }
        return hex;
    }

}
/* AI生成 - 20行 */
