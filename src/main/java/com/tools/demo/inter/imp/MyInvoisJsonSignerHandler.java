package com.tools.demo.inter.imp;

import java.io.FileInputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.cert.X509Certificate;
import java.util.Base64;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.tools.demo.exceptionHandlers.ApiException;
import com.tools.demo.inter.ApiHandler;
import com.tools.demo.utils.GenerateSignedCertificate;
import com.tools.demo.utils.InvioceJsonTreeUtil;
import com.tools.demo.vo.ApiResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class MyInvoisJsonSignerHandler implements ApiHandler {

    private static final Logger logger = LoggerFactory.getLogger(MyInvoisJsonSignerHandler.class);

    @Override
    public String getApiMethodName() {
        return "getSigner";
    }

    @Override
    public ApiResponse handle(Map<String, Object> params) throws ApiException {
        try {
            // 生成自签名证书，实际应用中应该使用已有的证书
            String alias = "mykey"; // 密钥别名
            String password = "password"; // 密钥密码
            String keystorePath = "keystore.p12";// 生成证书的路径,这里放到项目根目录下
            Object[] keyPair = GenerateSignedCertificate.generateSignedCertificate(alias, password, keystorePath);
            PrivateKey privateKey = (PrivateKey) keyPair[0]; // 获取私钥
            X509Certificate cert = (X509Certificate) keyPair[1]; // 获取证书

            logger.info("成功生成自签名证书:");
            logger.info("私钥算法: " + privateKey.getAlgorithm());
            logger.info("证书主题: " + cert.getSubjectX500Principal());
            logger.info("证书颁发者: " + cert.getIssuerX500Principal());
            logger.info("证书有效期: " + cert.getNotBefore() + " 至 " + cert.getNotAfter());
        } catch (Exception e) {
            logger.error("生成自签名证书失败: " + e.getMessage());
            throw new ApiException(9999, "生成自签名证书失败: " + e.getMessage());
        }
        // 1. 这里从外部传入生成好的发票JSON，不包含签名信息
        Object paramsObj = params.get("params");

        if (!(paramsObj instanceof Map)) {
            throw new ApiException(9999, "Invalid params format");
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> details = (Map<String, Object>) paramsObj;
        // String originalJson = MapUtil.getStr(details, "invoiceJson");

        String ublExtensionsJson = null; // 存放签名属性部分
        String creatInvoiceJson = null; // 最终包含签名的JSON字符串
        try {

            // 2. 转换文档(步骤1)
            // 最小化JSON(移除换行和空格)
            ObjectMapper mapper = new ObjectMapper();
            // Object jsonObj = mapper.readValue(originalJson, Object.class);
            String minifiedJson = mapper.writer().without(SerializationFeature.INDENT_OUTPUT)
                    .writeValueAsString(details);

            // 3. 计算文档摘要(DocDigest)(步骤2)
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] docDigest = md.digest(minifiedJson.getBytes(StandardCharsets.UTF_8));
            String docDigestBase64 = Base64.getEncoder().encodeToString(docDigest);

            // 4. 加载密钥库和证书
            KeyStore ks = KeyStore.getInstance("PKCS12");
            // 使用之前生成的密钥库
            ks.load(new FileInputStream("keystore.p12"), "password".toCharArray());
            PrivateKey privateKey = (PrivateKey) ks.getKey("mykey", "password".toCharArray());
            X509Certificate cert = (X509Certificate) ks.getCertificate("mykey");
            PublicKey publicKey = cert.getPublicKey();
            // 转换为Base64字符串
            String publicKeyString = Base64.getEncoder().encodeToString(publicKey.getEncoded());
            // 输出公钥信息
            logger.info("公钥(Base64): " + publicKeyString);
            // 5. 使用证书私匙对文档摘要进行签名(Sig)(步骤3)
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initSign(privateKey);
            signature.update(docDigest);
            byte[] sigBytes = signature.sign();
            String sigBase64 = Base64.getEncoder().encodeToString(sigBytes);

            // 6. 计算证书摘要(CertDigest)(步骤4)
            byte[] certDigest = md.digest(cert.getEncoded());
            String certDigestBase64 = Base64.getEncoder().encodeToString(certDigest);

            // 7. 准备签名属性部分(步骤5)
            String signingTime = "2024-07-23T15:14:54Z"; // 示例时间，实际应使用当前时间
            String issuerName = cert.getIssuerX500Principal().getName();
            String serialNumber = cert.getSerialNumber().toString();

            // 8. 创建UblExtensionsJson和Signature的 JSON 树(步骤6)
            ObjectNode root = InvioceJsonTreeUtil.createInvioceJson(mapper, md, docDigestBase64, cert, sigBase64,
                    certDigestBase64,
                    signingTime, issuerName, serialNumber);

            // 最终序列化为单行 JSON 字符串
            ublExtensionsJson = mapper.writer().without(SerializationFeature.INDENT_OUTPUT).writeValueAsString(root);
            // 将签名部分ublExtensionsJson放入发票JSON中的Invoice节点下，保留原来的结构,组合成带有签名的发票JSON
            creatInvoiceJson = creatInvoiceJson(ublExtensionsJson, minifiedJson, mapper);
        } catch (Exception e) {
            throw new ApiException(5001, "JSON处理失败: " + e.getMessage());
        }
        // 9. 输出签名后的文档
        logger.info("Signed JSON Document:");
        logger.info(creatInvoiceJson);

        return ApiResponse.success(creatInvoiceJson);
    }

    /**
     * 创建完整发票JSON
     * 
     * @param ublExtensionsJson 签名部分，包含UBLExtensions和Signature
     * @param minifiedJson      发票部分
     * @param mapper
     * @return String 最终包含签名的JSON字符串
     * @throws Exception
     */
    private String creatInvoiceJson(String ublExtensionsJson, String minifiedJson, ObjectMapper mapper)
            throws Exception {
        String invoiceJson = null;

        // 将 ublExtensionsJson 注入到最小化的 minifiedJson 的 Invoice 节点下
        JsonNode signedRootNode = mapper.readTree(ublExtensionsJson);
        JsonNode ublextNode = signedRootNode.get("UBLExtensions");
        JsonNode signatureNode = signedRootNode.get("Signature");

        // 解析原始最小化 JSON（minifiedJson 已在上方生成）
        JsonNode minNode = mapper.readTree(minifiedJson);

        if (minNode.isObject()) {
            ObjectNode minObj = (ObjectNode) minNode;
            JsonNode invoiceNode = minObj.get("Invoice");
            if (invoiceNode != null) {
                if (invoiceNode.isArray()) {
                    ArrayNode arr = (ArrayNode) invoiceNode;
                    for (int i = 0; i < arr.size(); i++) {
                        JsonNode item = arr.get(i);
                        if (item.isObject()) {
                            ObjectNode itemObj = (ObjectNode) item;
                            if (ublextNode != null)
                                itemObj.set("UBLExtensions", ublextNode.deepCopy());
                            if (signatureNode != null)
                                itemObj.set("Signature", signatureNode.deepCopy());
                        }
                    }
                } else if (invoiceNode.isObject()) {
                    ObjectNode invObj = (ObjectNode) invoiceNode;
                    if (ublextNode != null)
                        invObj.set("UBLExtensions", ublextNode.deepCopy());
                    if (signatureNode != null)
                        invObj.set("Signature", signatureNode.deepCopy());
                }
            } else {
                // 如果不存在 Invoice 节点，则将 UBLExtensions / Signature 直接放到根（按需）
                if (ublextNode != null)
                    minObj.set("UBLExtensions", ublextNode.deepCopy());
                if (signatureNode != null)
                    minObj.set("Signature", signatureNode.deepCopy());
            }
            // 将合并后的最小化 JSON 作为最终签名文档
            invoiceJson = mapper.writer().without(SerializationFeature.INDENT_OUTPUT).writeValueAsString(minObj);
        }

        return invoiceJson;

    }

}
