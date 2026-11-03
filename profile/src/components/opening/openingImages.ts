const IMAGE_TIMEOUT_MS = 3000;

export function decodeOpeningImages(
  images: readonly HTMLImageElement[],
  signal: AbortSignal,
  timeoutMs = IMAGE_TIMEOUT_MS,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', handleAbort);
    };
    const handleAbort = () => {
      cleanup();
      reject(new DOMException('Opening image preparation aborted', 'AbortError'));
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('Opening image preparation timed out'));
    }, timeoutMs);

    if (signal.aborted) {
      handleAbort();
      return;
    }

    signal.addEventListener('abort', handleAbort, { once: true });
    void Promise.all(images.map(image => image.decode())).then(() => {
      cleanup();
      resolve();
    }, error => {
      cleanup();
      reject(error);
    });
  });
}

export async function loadOpeningImages(urls: readonly string[], signal: AbortSignal) {
  signal.throwIfAborted();
  const images = urls.map(url => {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    return image;
  });

  try {
    await decodeOpeningImages(images, signal);
    return images;
  } catch (error) {
    for (const image of images) {
      image.src = '';
    }
    throw error;
  }
}
