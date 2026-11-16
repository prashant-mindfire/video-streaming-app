export const uploadPart = (
  uploadUrl: string,
  chunk: Blob,
  onProgress: (loaded: number) => void,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', uploadUrl);
    xhr.withCredentials = false;

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(event.loaded);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader('ETag');

        if (!etag) {
          reject(new Error('ETag header is missing from the upload response.'));
          return;
        }

        resolve(etag);
        return;
      }

      reject(new Error(`Part upload failed with status ${xhr.status}.`));
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading video part.'));
    };

    xhr.onabort = () => {
      reject(new Error('Video part upload was aborted.'));
    };

    xhr.send(chunk);
  });
};
