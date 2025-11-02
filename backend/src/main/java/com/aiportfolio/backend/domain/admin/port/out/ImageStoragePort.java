package com.aiportfolio.backend.domain.admin.port.out;

import java.util.List;

/**
 * 이미지 저장소 포트 인터페이스
 * 이미지 업로드, 삭제, 최적화 기능을 정의합니다.
 */
public interface ImageStoragePort {
    
    /**
     * 단일 이미지를 업로드합니다.
     * 
     * @param imageData 이미지 바이트 데이터
     * @param folder 업로드할 폴더
     * @param metadata 이미지 메타데이터
     * @return 업로드된 이미지 URL
     */
    String uploadImage(byte[] imageData, String folder, ImageMetadata metadata);
    
    /**
     * 다중 이미지를 업로드합니다.
     * 
     * @param imagesData 이미지 바이트 데이터 목록
     * @param folder 업로드할 폴더
     * @param metadata 이미지 메타데이터
     * @return 업로드된 이미지 URL 목록
     */
    List<String> uploadImages(List<byte[]> imagesData, String folder, ImageMetadata metadata);
    
    /**
     * 이미지를 삭제합니다.
     * 
     * @param publicId 삭제할 이미지의 Public ID
     */
    void deleteImage(String publicId);
    
    /**
     * URL에서 Public ID를 추출합니다.
     * 
     * @param url 이미지 URL
     * @return Public ID
     */
    String extractPublicId(String url);
    
    /**
     * 이미지 URL을 최적화된 형태로 변환합니다.
     * 
     * @param url 원본 이미지 URL
     * @param width 최적화할 너비
     * @param height 최적화할 높이
     * @return 최적화된 이미지 URL
     */
    String optimizeImageUrl(String url, int width, int height);
    
    /**
     * 이미지 메타데이터 클래스
     */
    class ImageMetadata {
        private final int maxWidth;
        private final int maxHeight;
        private final String quality;
        private final String format;
        
        public ImageMetadata(int maxWidth, int maxHeight, String quality, String format) {
            this.maxWidth = maxWidth;
            this.maxHeight = maxHeight;
            this.quality = quality;
            this.format = format;
        }
        
        public int getMaxWidth() { return maxWidth; }
        public int getMaxHeight() { return maxHeight; }
        public String getQuality() { return quality; }
        public String getFormat() { return format; }
        
        public static ImageMetadata defaultMetadata() {
            return new ImageMetadata(1000, 1000, "auto", "auto");
        }
    }
}
