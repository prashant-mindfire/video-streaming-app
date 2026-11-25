import { pool } from '../src/config/db';
import logger from '../src/utils/logger';
import { withTransaction } from '../src/utils/withTransaction';

const seed = async () => {
  try {
    await withTransaction(async (client) => {
      // Seed Users (1 Admin + 1 Regular Creator/Viewer)
      const adminId = '11111111-1111-1111-1111-111111111111';
      const userId = '22222222-2222-2222-2222-222222222222';

      await client.query(
        `INSERT INTO public.users (id, name, email, password_hash, role)
         VALUES
           ($1, 'Admin User', 'admin@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
           ($2, 'Demo Creator', 'creator@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
         ON CONFLICT (id) DO NOTHING`,
        [adminId, userId]
      );

      // Seed Ready Videos
      const video1Id = '33333333-3333-3333-3333-333333333333';
      const video2Id = '44444444-4444-4444-4444-444444444444';

      await client.query(
        `INSERT INTO public.videos (
           id, user_id, title, description, original_object_key,
           thumbnail_object_key, hls_master_playlist_key, file_size,
           duration_seconds, width, height, codec, status
         )
         VALUES
           (
             $1, $2,
             'Big Buck Bunny - Adaptive Stream Demo',
             'Sample 1080p HLS video with multi-bitrate variants.',
             'uploads/seed/big-buck-bunny/original.mp4',
             'thumbnails/seed/big-buck-bunny/thumb.jpg',
             'hls/seed/big-buck-bunny/master.m3u8',
             158008374, 596, 1920, 1080, 'h264', 'ready'
           ),
           (
             $3, $2,
             'Tears of Steel - Sci-Fi Short',
             'Sample 720p HLS video for testing player playback and analytics.',
             'uploads/seed/tears-of-steel/original.mp4',
             'thumbnails/seed/tears-of-steel/thumb.jpg',
             'hls/seed/tears-of-steel/master.m3u8',
             94371840, 734, 1280, 720, 'h264', 'ready'
           )
         ON CONFLICT (id) DO NOTHING`,
        [video1Id, userId, video2Id]
      );

      // Seed HLS Video Variants (1080p, 720p, 480p)
      await client.query(
        `INSERT INTO public.video_variants (
           video_id, resolution, width, height, codec, bitrate,
           file_size, object_key, playlist_object_key, segments_prefix, status
         )
         VALUES
           ($1, '1080p', 1920, 1080, 'h264', 5000000, 120000000, 'hls/seed/big-buck-bunny/1080p.mp4', 'hls/seed/big-buck-bunny/1080p/index.m3u8', 'hls/seed/big-buck-bunny/1080p/', 'ready'),
           ($1, '720p',  1280, 720,  'h264', 2800000,  75000000, 'hls/seed/big-buck-bunny/720p.mp4',  'hls/seed/big-buck-bunny/720p/index.m3u8',  'hls/seed/big-buck-bunny/720p/',  'ready'),
           ($1, '480p',  854,  480,  'h264', 1400000,  40000000, 'hls/seed/big-buck-bunny/480p.mp4',  'hls/seed/big-buck-bunny/480p/index.m3u8',  'hls/seed/big-buck-bunny/480p/',  'ready'),
           ($2, '720p',  1280, 720,  'h264', 2800000,  82000000, 'hls/seed/tears-of-steel/720p.mp4',  'hls/seed/tears-of-steel/720p/index.m3u8',  'hls/seed/tears-of-steel/720p/',  'ready'),
           ($2, '480p',  854,  480,  'h264', 1400000,  45000000, 'hls/seed/tears-of-steel/480p.mp4',  'hls/seed/tears-of-steel/480p/index.m3u8',  'hls/seed/tears-of-steel/480p/',  'ready')
         ON CONFLICT (video_id, resolution) DO NOTHING`,
        [video1Id, video2Id]
      );

      // Seed Video Events
      const event1Id = '55555555-5555-5555-5555-555555555551';
      const event2Id = '55555555-5555-5555-5555-555555555552';
      const event3Id = '55555555-5555-5555-5555-555555555553';

      await client.query(
        `INSERT INTO public.video_events (id, video_id, user_id, event_type)
         VALUES
           ($1, $3, $5, 'view'),
           ($2, $3, NULL, 'view'),
           ($4, $6, $5, 'download')
         ON CONFLICT (id) DO NOTHING`,
        [event1Id, event2Id, video1Id, event3Id, adminId, video2Id]
      );
    });

    logger.info('Database seeded successfully.');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

seed();
