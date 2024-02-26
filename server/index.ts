import fs from 'node:fs';
import path from 'node:path';
import util from 'node:util';
import { pipeline } from 'node:stream';
import fastify from 'fastify';
import multipart from '@fastify/multipart';

const pump = util.promisify(pipeline);

const DOWNLOAD = '/Users/leyoweb/Downloads';

const app = fastify({
  logger: true
});
app.register(multipart);

app.get('/', (request, reply) => {
  const html = fs.readFileSync(path.resolve(__dirname, '../client/index.html'), { encoding: 'utf-8' });
  reply.type('text/html');
  reply.send(html);
});

app.post('/api/upload', async (request, reply) => {
  const data = await request.file();
  if (!data) {
    reply.send({
      success: false,
      message: '上传失败',
    });
    return;
  }
  const target = path.resolve(DOWNLOAD, data.filename);
  await pump(data.file, fs.createWriteStream(target));
  reply.send({
    success: true,
    message: `上传成功！文件路径：${target}`,
  });
});


app.listen({ port: 3000 }, function (err, address) {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  console.log('服务已启动');
})