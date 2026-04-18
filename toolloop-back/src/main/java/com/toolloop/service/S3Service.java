package com.toolloop.service;

import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.config.ConfigProvider;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import javax.enterprise.context.ApplicationScoped;
import javax.ws.rs.BadRequestException;
import javax.ws.rs.InternalServerErrorException;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Slf4j
@ApplicationScoped
public class S3Service {
    private static final long SIGNATURE_LIFE_TIME_IN_MINUTES = 10L;
    private static final ObjectCannedACL DEFAULT_ACL = ObjectCannedACL.PUBLIC_READ;
    private static final String DEFAULT_CACHE_CONTROL = "public, max-age=31536000";

    public static S3Client createS3Client() {
        String region = ConfigProvider.getConfig().getValue("aws.s3.region", String.class);
        String accessKeyId = ConfigProvider.getConfig().getValue("aws.s3.accessKeyId", String.class);
        String secretAccessKey = ConfigProvider.getConfig().getValue("aws.s3.secretAccessKey", String.class);

        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKeyId, secretAccessKey)
                ))
                .httpClientBuilder(UrlConnectionHttpClient.builder())
                .build();
    }

    public static byte[] downloadFile(String key, String bucketName, S3Client s3Client) {
        long start = System.currentTimeMillis();
        try {
            log.info("Downloading file from S3 bucket: {} key: {}", bucketName, key);

            var getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            var s3Object = s3Client.getObject(getObjectRequest);
            return s3Object.readAllBytes();
        } catch (Exception e) {
            log.error("Error downloading file from S3", e);
            throw new InternalServerErrorException("Error downloading file from S3", e);
        } finally {
            log.info("File downloaded in {} ms", System.currentTimeMillis() - start);
        }
    }


    public static PutObjectResponse uploadFile(String key, byte[] bytes, String bucketName, S3Client s3Client) {
        long start = System.currentTimeMillis();
        try {
            log.info("Uploading file to S3 bucket: {} key: {}", bucketName, key);
            var uploadResponse = s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .acl(DEFAULT_ACL)
                            .cacheControl(DEFAULT_CACHE_CONTROL)
                            .build(),
                    RequestBody.fromBytes(bytes));
            log.info("uploadResponse: {}", uploadResponse);
            if (!uploadResponse.sdkHttpResponse().isSuccessful())
                throw new InternalServerErrorException("S3 response not successful :" + uploadResponse.sdkHttpResponse().statusText());
            return uploadResponse;
        } catch (Exception e) {
            log.error("Error uploading file to S3", e);
            throw new InternalServerErrorException("Error uploading file to S3", e);
        } finally {
            log.info("File uploaded in {} ms", System.currentTimeMillis() - start);
        }
    }

    public static String getURLObject(String filename, String bucketName, S3Client s3Client) {
        GetUrlRequest request = GetUrlRequest.builder().bucket(bucketName).key(filename).build();
        String url = s3Client.utilities().getUrl(request).toExternalForm();
        return url;
    }

    public static void copyObject(String sourceKey, String destinationKey, String bucket){
        CopyObjectRequest copyReq = CopyObjectRequest.builder()
                .sourceBucket(bucket)
                .sourceKey(sourceKey)
                .destinationBucket(bucket)
                .destinationKey(destinationKey)
                .build();
        createS3Client().copyObject(copyReq);
    }

    public static void deleteObjectByObjectURL(String objectUrl, String awsS3ResourcesBucket, S3Client s3Client) throws IOException, URISyntaxException {
        URI uri = new URI(objectUrl);
        String oldKey = URLDecoder.decode(uri.getPath().substring(1), String.valueOf(StandardCharsets.UTF_8));
        s3Client.deleteObject(DeleteObjectRequest.builder()
                        .bucket(awsS3ResourcesBucket)
                        .key(oldKey)
                .build());
    }

    public static void deleteObjectByKey(String key, String bucketName) {
        try {
            createS3Client().deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build());
        } catch (Exception e) {
            log.error("Error deleting object from S3", e);
            throw new InternalServerErrorException("Error deleting object from S3", e);
        }
    }

    public static List<String> listAllObjectUrls(String bucketName, S3Client s3Client) {
        List<String> urls = new ArrayList<>();
        try {
            ListObjectsV2Request request = ListObjectsV2Request.builder().bucket(bucketName).build();
            ListObjectsV2Response result = s3Client.listObjectsV2(request);
            for (S3Object content : result.contents()) {
                String url = getURLObject(content.key(), bucketName, s3Client);
                urls.add(url);
            }
        } catch (Exception e) {
            log.error("Error listing objects from S3", e);
            throw new InternalServerErrorException("Error listing objects from S3", e);
        }
        return urls;
    }

    public static String createUploadPresignedUrl(String filename, String bucketName, boolean isPublic) {
        try (S3Presigner presigner = S3Presigner.create()) {
            PutObjectRequest objectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(filename)
                    .acl(isPublic ? ObjectCannedACL.PUBLIC_READ : DEFAULT_ACL)
                    .cacheControl(DEFAULT_CACHE_CONTROL)
                    .build();

            PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(SIGNATURE_LIFE_TIME_IN_MINUTES))
                    .putObjectRequest(objectRequest)
                    .build();

            PresignedPutObjectRequest presignedRequest = presigner.presignPutObject(presignRequest);

            return presignedRequest.url().toExternalForm();
        }
    }

    public static String createPresignedGetDownloadableUrl(String filename, String bucketName) {
        try (S3Client s3Client = S3Client.create()) {
            ListObjectsV2Request listObjectsV2Request = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(filename)
                    .build();

            ListObjectsV2Response result = s3Client.listObjectsV2(listObjectsV2Request);

            S3Object latestFile = result.contents().stream()
                    .max(Comparator.comparing(S3Object::lastModified))
                    .orElseThrow(() -> new BadRequestException("No files found in the specified folder."));

            return generatePresignedUrl(latestFile.key(), bucketName);
        }
    }

    private static String generatePresignedUrl(String keyName, String bucketName) {
        try (S3Presigner presigner = S3Presigner.create()) {
            GetObjectRequest objectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(keyName)
                    .build();

            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(SIGNATURE_LIFE_TIME_IN_MINUTES))
                    .getObjectRequest(objectRequest)
                    .build();

            URL url = presigner.presignGetObject(presignRequest).url();

            return url.toExternalForm();
        }
    }

    public static String updateObjectNameAndUrlNameByUrl(String oldKey, String newKey, String bucketName, boolean isPublic) {
        try {

            S3Client s3Client = createS3Client();

            CopyObjectRequest copyObjRequest = CopyObjectRequest.builder()
                    .sourceBucket(bucketName)
                    .sourceKey(oldKey)
                    .destinationBucket(bucketName)
                    .destinationKey(newKey)
                    .acl(isPublic ? ObjectCannedACL.PUBLIC_READ : DEFAULT_ACL)
                    .cacheControl(DEFAULT_CACHE_CONTROL)
                    .build();

            s3Client.copyObject(copyObjRequest);

            DeleteObjectRequest deleteObjRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(oldKey)
                    .build();

            s3Client.deleteObject(deleteObjRequest);

            String url = getURLObject(newKey, bucketName, s3Client);

            return url;
        } catch (Exception e) {
            log.error("Error updating object name", e);
            throw new InternalServerErrorException("Error updating object name", e);
        }
    }
}
