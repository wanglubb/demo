package com.tools.demo.utils;

import java.io.FileOutputStream;
import java.math.BigInteger;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.KeyStore;
import java.security.PrivateKey;
import java.security.SecureRandom;
import java.security.Security;
import java.security.cert.Certificate;
import java.security.cert.X509Certificate;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import javax.security.auth.x500.X500Principal;

import org.bouncycastle.cert.jcajce.JcaX509CertificateConverter;
import org.bouncycastle.cert.jcajce.JcaX509v3CertificateBuilder;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.operator.ContentSigner;
import org.bouncycastle.operator.jcajce.JcaContentSignerBuilder;

public class GenerateSignedCertificate {

    /**
     * 生成自签名证书并返回私钥和证书
     * 
     * @param alias        密钥别名
     * @param password     密钥密码
     * @param keyStorePath 密钥库路径
     * @return 包含私钥和证书的数组，[0]为私钥，[1]为证书
     */
    public static Object[] generateSignedCertificate(String alias, String password, String keyStorePath)
            throws Exception {
        // 注册 BouncyCastle 提供者（若已注册则忽略）
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        // 1. 创建密钥对
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
        keyPairGenerator.initialize(2048, new SecureRandom());
        KeyPair keyPair = keyPairGenerator.generateKeyPair();
        PrivateKey privateKey = keyPair.getPrivate();

        // 2. 使用BouncyCastle创建自签名证书
        X509Certificate cert = createSelfSignedCertificate(keyPair);

        // 3. 创建密钥库并添加密钥和证书
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        keyStore.load(null, null);
        keyStore.setKeyEntry(alias, privateKey, password.toCharArray(), new Certificate[] { cert });

        // 4. 保存密钥库到文件
        try (FileOutputStream fos = new FileOutputStream(keyStorePath)) {
            keyStore.store(fos, password.toCharArray());
        }

        // 5. 返回私钥和证书
        return new Object[] { privateKey, cert };
    }

    /**
     * 创建自签名证书
     * 
     * @param keyPair 密钥对
     * @return 自签名X509证书
     */
    private static X509Certificate createSelfSignedCertificate(KeyPair keyPair) throws Exception {
        // 使用 Bouncy Castle 创建自签名证书
        X500Principal issuer = new X500Principal(
                "CN=Self Signed, OU=My Organization, O=My Company, L=Kuala Lumpur, ST=Selangor, C=MY");
        X500Principal subject = issuer;
        long now = System.currentTimeMillis();
        Date notBefore = new Date(now - TimeUnit.DAYS.toMillis(1));
        Date notAfter = new Date(now + TimeUnit.DAYS.toMillis(365));

        // serial
        BigInteger serial = BigInteger.valueOf(now);

        JcaX509v3CertificateBuilder certBuilder = new JcaX509v3CertificateBuilder(
                issuer,
                serial,
                notBefore,
                notAfter,
                subject,
                keyPair.getPublic());

        ContentSigner signer = new JcaContentSignerBuilder("SHA256WithRSA").build(keyPair.getPrivate());
        org.bouncycastle.cert.X509CertificateHolder certHolder = certBuilder.build(signer);
        java.security.cert.X509Certificate cert = new JcaX509CertificateConverter()
                .setProvider(BouncyCastleProvider.PROVIDER_NAME)
                .getCertificate(certHolder);

        return cert;
    }

}
