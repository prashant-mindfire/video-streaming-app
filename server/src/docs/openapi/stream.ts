/**
 * @openapi
 * /stream/{token}/{filePath}:
 *   get:
 *     summary: Stream an HLS playlist or segment
 *     description: |
 *       Streams an HLS asset for an active playback session. The file path
 *       may include nested path segments and must end in `.m3u8` or `.ts`.
 *       The playback token is issued when creating a playback session.
 *     tags: [Streaming]
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         description: 64-character hexadecimal playback token.
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{64}$'
 *       - name: filePath
 *         in: path
 *         required: true
 *         description: HLS asset path; nested segments are allowed.
 *         schema:
 *           type: string
 *           minLength: 1
 *         examples:
 *           masterPlaylist:
 *             value: master.m3u8
 *           segment:
 *             value: 720p/segment000.ts
 *     responses:
 *       '200':
 *         description: HLS playlist or MPEG-TS segment streamed successfully
 *         headers:
 *           Cache-Control:
 *             description: No-cache for playlists; immutable caching for segments.
 *             schema:
 *               type: string
 *           Content-Length:
 *             description: Included when provided by object storage.
 *             schema:
 *               type: integer
 *         content:
 *           application/vnd.apple.mpegurl:
 *             schema:
 *               type: string
 *               description: HLS playlist.
 *           video/mp2t:
 *             schema:
 *               type: string
 *               format: binary
 *               description: MPEG-TS segment.
 *       '400':
 *         description: Invalid playback token or HLS asset path
 *       '401':
 *         description: Playback session expired or invalid
 *       '404':
 *         description: HLS asset not found
 *       '500':
 *         description: Failed to retrieve the HLS asset
 */
