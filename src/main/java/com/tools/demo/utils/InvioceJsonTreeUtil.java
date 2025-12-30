package com.tools.demo.utils;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.cert.X509Certificate;
import java.util.Base64;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class InvioceJsonTreeUtil {

    public static ObjectNode createInvioceJson(ObjectMapper mapper, MessageDigest md, String docDigestBase64,
            X509Certificate cert, String sigBase64, String certDigestBase64, String signingTime, String issuerName,
            String serialNumber) throws Exception {

        // 8. 使用 Jackson 构建 SignedProperties 节点并计算其摘要(PropsDigest)
        ObjectNode signedPropsRoot = mapper.createObjectNode(); // SignedProperties 根节点
        signedPropsRoot.put("Target", "signature");// Target 节点

        ArrayNode signedPropertiesArr = signedPropsRoot.putArray("SignedProperties");// SignedProperties 数组
        ObjectNode signedPropsObj = mapper.createObjectNode();// SignedProperties 对象
        signedPropsObj.put("Id", "id-xades-signed-props");

        // SignedSignatureProperties 数组
        ArrayNode signedSigPropsArr = mapper.createArrayNode();
        ObjectNode signedSigPropsObj = mapper.createObjectNode();

        // SigningTime 节点
        ArrayNode signingTimeArr = mapper.createArrayNode();
        ObjectNode signingTimeObj = mapper.createObjectNode();
        signingTimeObj.put("_", signingTime);
        signingTimeArr.add(signingTimeObj);
        signedSigPropsObj.set("SigningTime", signingTimeArr);

        // SigningCertificate -> Cert -> CertDigest + IssuerSerial
        ArrayNode signingCertificateArr = mapper.createArrayNode();
        ObjectNode signingCertificateObj = mapper.createObjectNode();

        ArrayNode certArr = mapper.createArrayNode();
        ObjectNode certObjNode = mapper.createObjectNode();

        // CertDigest
        ArrayNode certDigestArr = mapper.createArrayNode();
        ObjectNode certDigestObj = mapper.createObjectNode();
        ArrayNode digestMethodArr = mapper.createArrayNode();
        ObjectNode digestMethodObj = mapper.createObjectNode();
        digestMethodObj.put("_", "");
        digestMethodObj.put("Algorithm", "http://www.w3.org/2001/04/xmlenc#sha256");
        digestMethodArr.add(digestMethodObj);
        certDigestObj.set("DigestMethod", digestMethodArr);
        ArrayNode digestValueArr = mapper.createArrayNode();
        ObjectNode dv = mapper.createObjectNode();
        dv.put("_", certDigestBase64);
        digestValueArr.add(dv);
        certDigestObj.set("DigestValue", digestValueArr);
        certDigestArr.add(certDigestObj);
        certObjNode.set("CertDigest", certDigestArr);

        // IssuerSerial
        ArrayNode issuerSerialArrCert = mapper.createArrayNode();
        ObjectNode issuerSerialObjCert = mapper.createObjectNode();
        ArrayNode issuerNameArrCert = mapper.createArrayNode();
        ObjectNode issuerNameObjCert = mapper.createObjectNode();
        issuerNameObjCert.put("_", issuerName);
        issuerNameArrCert.add(issuerNameObjCert);
        issuerSerialObjCert.set("X509IssuerName", issuerNameArrCert);
        ArrayNode serialNumberArrCert = mapper.createArrayNode();
        ObjectNode serialNumObjCert = mapper.createObjectNode();
        serialNumObjCert.put("_", serialNumber);
        serialNumberArrCert.add(serialNumObjCert);
        issuerSerialObjCert.set("X509SerialNumber", serialNumberArrCert);
        issuerSerialArrCert.add(issuerSerialObjCert);
        certObjNode.set("IssuerSerial", issuerSerialArrCert);

        certArr.add(certObjNode);
        signingCertificateObj.set("Cert", certArr);
        signingCertificateArr.add(signingCertificateObj);
        signedSigPropsObj.set("SigningCertificate", signingCertificateArr);

        signedSigPropsArr.add(signedSigPropsObj);
        signedPropsObj.set("SignedSignatureProperties", signedSigPropsArr);

        signedPropertiesArr.add(signedPropsObj);

        // 将 SignedProperties 节点序列化为最小化字符串并计算摘要
        String signedPropsJsonString = mapper.writer().without(SerializationFeature.INDENT_OUTPUT)
                .writeValueAsString(signedPropsRoot);
        byte[] propsDigest = md.digest(signedPropsJsonString.getBytes(StandardCharsets.UTF_8));
        String propsDigestBase64 = Base64.getEncoder().encodeToString(propsDigest);

        // 9. 使用已构建的 SignedProperties 节点继续构建完整签名 JSON（后续代码使用
        // signedPropsRoot.get("SignedProperties")）
        JsonNode signedPropertiesNode = signedPropsRoot.get("SignedProperties");

        ObjectNode root = mapper.createObjectNode();
        ArrayNode ublextensions = root.putArray("UBLExtensions");
        ObjectNode ublextensionWrapper = mapper.createObjectNode();
        ublextensions.add(ublextensionWrapper);

        ArrayNode ublextensionArray = ublextensionWrapper.putArray("UBLExtension");
        ObjectNode ublextension = mapper.createObjectNode();
        ublextensionArray.add(ublextension);

        ArrayNode extensionURI = ublextension.putArray("ExtensionURI");
        ObjectNode extUriObj = mapper.createObjectNode();
        extUriObj.put("_", "urn:oasis:names:specification:ubl:dsig:enveloped:xades");
        extensionURI.add(extUriObj);

        ArrayNode extensionContent = ublextension.putArray("ExtensionContent");
        ObjectNode extensionContentObj = mapper.createObjectNode();
        extensionContent.add(extensionContentObj);

        ArrayNode ublDocumentSignaturesArr = extensionContentObj.putArray("UBLDocumentSignatures");
        ObjectNode ublDocumentSignatures = mapper.createObjectNode();
        ublDocumentSignaturesArr.add(ublDocumentSignatures);

        ArrayNode sigInfoArr = ublDocumentSignatures.putArray("SignatureInformation");
        ObjectNode sigInfoObj = mapper.createObjectNode();
        // SignatureInformation -> ID\ReferencedSignatureID\Signature
        sigInfoArr.add(sigInfoObj);
        ArrayNode signatureArr = sigInfoObj.putArray("Signature");
        ArrayNode idArr = sigInfoObj.putArray("ID");
        ArrayNode referencedSignatureIDArr = sigInfoObj.putArray("ReferencedSignatureID");

        // ID节点创建
        ObjectNode idObj = mapper.createObjectNode();
        idArr.add(idObj);
        idObj.put("_", "urn:oasis:names:specification:ubl:signature:1");

        // ReferencedSignatureID 节点创建
        ObjectNode referencedSignatureIDObj = mapper.createObjectNode();
        referencedSignatureIDArr.add(referencedSignatureIDObj);
        referencedSignatureIDObj.put("_", "urn:oasis:names:specification:ubl:signature:Invoice");

        // Signature 节点创建
        ObjectNode signatureObj = mapper.createObjectNode();
        signatureArr.add(signatureObj);

        // 保留 Id 为单值
        signatureObj.put("Id", "signature");

        // Object -> QualifyingProperties -> SignedProperties（均作为数组容器）
        ArrayNode objectArr = signatureObj.putArray("Object");
        ObjectNode objectNode = mapper.createObjectNode();
        objectArr.add(objectNode);
        ArrayNode qualifyingPropsArr = objectNode.putArray("QualifyingProperties");
        ObjectNode qualifyingPropsObj = mapper.createObjectNode();
        qualifyingPropsObj.put("Target", "signature");
        if (signedPropertiesNode != null) {
            // signedPropertiesNode 本身是数组，直接深拷贝放入 SignedProperties 字段
            qualifyingPropsObj.set("SignedProperties", signedPropertiesNode.deepCopy());
        } else {
            qualifyingPropsObj.putArray("SignedProperties");
        }
        qualifyingPropsArr.add(qualifyingPropsObj);

        // KeyInfo -> X509Data -> 最底层字段以数组包对象形式出现，且最底层为对象（有 "_" 字段）
        ArrayNode keyInfoArr = signatureObj.putArray("KeyInfo");
        ObjectNode keyInfoObj = mapper.createObjectNode();
        keyInfoArr.add(keyInfoObj);

        ArrayNode x509DataArr = keyInfoObj.putArray("X509Data");
        ObjectNode x509DataObj = mapper.createObjectNode();
        x509DataArr.add(x509DataObj);

        ArrayNode x509CertArr = x509DataObj.putArray("X509Certificate");
        ObjectNode x509CertObj = mapper.createObjectNode();
        x509CertObj.put("_", Base64.getEncoder().encodeToString(cert.getEncoded()));
        x509CertArr.add(x509CertObj);

        ArrayNode subjArr = x509DataObj.putArray("X509SubjectName");
        ObjectNode subjObj = mapper.createObjectNode();
        subjObj.put("_", cert.getSubjectX500Principal().getName());
        subjArr.add(subjObj);

        ArrayNode issuerSerialArr = x509DataObj.putArray("X509IssuerSerial");
        ObjectNode issuerSerialObj = mapper.createObjectNode();
        ArrayNode issuerNameArr = issuerSerialObj.putArray("X509IssuerName");
        ObjectNode issuerNameObj = mapper.createObjectNode();
        issuerNameObj.put("_", issuerName);
        issuerNameArr.add(issuerNameObj);
        ArrayNode serialNumberArr = issuerSerialObj.putArray("X509SerialNumber");
        ObjectNode serialNumObj = mapper.createObjectNode();
        serialNumObj.put("_", serialNumber);
        serialNumberArr.add(serialNumObj);
        issuerSerialArr.add(issuerSerialObj);

        // SignatureValue 作为数组，内部对象包含 "_" 值
        ArrayNode sigValueArr = signatureObj.putArray("SignatureValue");
        ObjectNode sigValueObj = mapper.createObjectNode();
        sigValueObj.put("_", sigBase64);
        sigValueArr.add(sigValueObj);

        // SignedInfo -> Reference array（SignedProperties 摘要 和 文档摘要），并确保
        // DigestMethod/DigestValue 都为数组-对象形式
        ArrayNode signedInfoArr = signatureObj.putArray("SignedInfo");
        ObjectNode signedInfoObj = mapper.createObjectNode();
        signedInfoArr.add(signedInfoObj);
        ArrayNode referenceArr = signedInfoObj.putArray("Reference");

        ObjectNode refSignedProps = mapper.createObjectNode();
        refSignedProps.put("Type", "http://uri.etsi.org/01903/v1.3.2#SignedProperties");
        refSignedProps.put("URI", "#id-xades-signed-props");
        ArrayNode ref1DigestMethodArr = refSignedProps.putArray("DigestMethod");
        ObjectNode ref1DigestMethodObj = mapper.createObjectNode();
        ref1DigestMethodObj.put("_", "");
        ref1DigestMethodObj.put("Algorithm", "http://www.w3.org/2001/04/xmlenc#sha256");
        ref1DigestMethodArr.add(ref1DigestMethodObj);
        ArrayNode ref1DigestValueArr = refSignedProps.putArray("DigestValue");
        ObjectNode ref1DigestValueObj = mapper.createObjectNode();
        ref1DigestValueObj.put("_", propsDigestBase64);
        ref1DigestValueArr.add(ref1DigestValueObj);
        referenceArr.add(refSignedProps);

        ObjectNode refDoc = mapper.createObjectNode();
        refDoc.put("Type", "");
        refDoc.put("URI", "");
        ArrayNode ref2DigestMethodArr = refDoc.putArray("DigestMethod");
        ObjectNode ref2DigestMethodObj = mapper.createObjectNode();
        ref2DigestMethodObj.put("_", "");
        ref2DigestMethodObj.put("Algorithm", "http://www.w3.org/2001/04/xmlenc#sha256");
        ref2DigestMethodArr.add(ref2DigestMethodObj);
        ArrayNode ref2DigestValueArr = refDoc.putArray("DigestValue");
        ObjectNode ref2DigestValueObj = mapper.createObjectNode();
        ref2DigestValueObj.put("_", docDigestBase64);
        ref2DigestValueArr.add(ref2DigestValueObj);
        referenceArr.add(refDoc);

        // 额外的高层级 Signature 标记（保留原来结构里的说明部分）
        ArrayNode outerSignatureArr = root.putArray("Signature");
        ObjectNode outerSignature = mapper.createObjectNode();
        outerSignatureArr.add(outerSignature);
        ArrayNode outerIdArr = outerSignature.putArray("ID");
        ObjectNode outerIdObj = mapper.createObjectNode();
        outerIdObj.put("_", "urn:oasis:names:specification:ubl:signature:Invoice");
        outerIdArr.add(outerIdObj);
        ArrayNode outerSigMethodArr = outerSignature.putArray("SignatureMethod");
        ObjectNode outerSigMethod = mapper.createObjectNode();
        outerSigMethod.put("_", "urn:oasis:names:specification:ubl:dsig:enveloped:xades");
        outerSigMethodArr.add(outerSigMethod);
        return root;

    }

}
