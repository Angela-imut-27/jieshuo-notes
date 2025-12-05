*/
fitur hdvideo 
creator : Z7
note Sorry tdi sibuk dlu
/*
import ffmpeg from 'fluent-ffmpeg';
import {
  promises as fs
} from 'fs';
import {
  tmpdir
} from 'os';
import {
  join
} from 'path';

/**
 * Converts a video to HD resolution using fluent-ffmpeg.
 * @param {import('@whiskeysockets/baileys').WASocket} conn
 * @param {import('@whiskeysockets/baileys').WAMessage} m
 */
const handler = async (m, {
  conn
}) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || q.mediaType || '';
  if (!/video/g.test(mime)) {
    return m.reply('Reply/kirim video yang ingin diubah ke HD!');
  }

  let tmpIn = join(tmpdir(), `${Date.now()}.mp4`);
  let tmpOut = join(tmpdir(), `${Date.now()}_hd.mp4`);

  try {
    m.reply('Sedang memproses video ke kualitas HD, mohon tunggu...');

    let media = await q.download();
    await fs.writeFile(tmpIn, media);

    await new Promise((resolve, reject) => {
      ffmpeg(tmpIn)
        .outputOptions([
          '-vf', 'scale=1280:720:flags=lanczos,unsharp=5:5:1.0:5:5:0.0', // Scale to 720p, sharpen
          '-c:v', 'libx264', // Video codec
          '-preset', 'slow', // Encoding speed vs. compression
          '-crf', '22', // Constant Rate Factor (quality, lower is better)
          '-c:a', 'aac', // Audio codec
          '-b:a', '192k' // Audio bitrate
        ])
        .on('error', (err) => {
          console.error('FFmpeg Error:', err.message);
          reject(new Error(`Gagal mengonversi video: ${err.message}`));
        })
        .on('end', () => {
          resolve(true);
        })
        .save(tmpOut);
    });

    await conn.sendFile(m.chat, tmpOut, 'video_hd.mp4', 'Ini videonya dalam versi HD.', m);
  } catch (error) {
    console.error(error);
    m.reply(`Terjadi kesalahan: ${error.message || 'Tidak dapat memproses video.'}`);
  } finally {
    // Cleanup temporary files
    if (await fs.stat(tmpIn).catch(() => false)) await fs.unlink(tmpIn);
    if (await fs.stat(tmpOut).catch(() => false)) await fs.unlink(tmpOut);
  }
};

handler.help = ['hdvideo'];
handler.tags = ['tools', 'converter'];
handler.command = /^(hdvideo|tovideohd|hdv)$/i;
handler.description = 'Meningkatkan kualitas video ke resolusi HD (720p).';

handler.limit = true;
handler.premium = false;

export default handler;