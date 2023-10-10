import koa from "koa";
import Router from "koa-router";
import {koaBody} from "koa-body"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import cors from 'koa2-cors';
import fs from "fs"
import mime from 'mime-types'
import pdf from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// const db = require('../database/conn');
import db from "./database/conn.mjs";
const app = new koa()
const router = new Router()


// app.use();
app.use(cors({
  origin: function(ctx) { //设置允许来自指定域名请求
      if (ctx.url === '/upload') {
          return '*'; // 允许来自所有域名请求
      }
      return 'http://localhost:3000'; //只允许http://localhost:8080这个域名的请求
  },
  maxAge: 5, //指定本次预检请求的有效期，单位为秒。
  credentials: true, //是否允许发送Cookie
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
}));
app.use(async (ctx, next)=>{
    ctx.state = {
      userName: 'andy One'
    }
    await next(); // 继续向下匹配路由
  })
// 配置路由
router.get('/', async (ctx)=>{
  try{
    let users = await db.collection("user");
    let user = {};
    user.name = 'andyOne' + Math.floor(Math.random()*100);
    user.age = Math.floor(Math.random()*100)
    let result = await users.insertOne(user);
    ctx.body="hello to extract-text"
  }catch(e){
    console.log(e)
  }
});

router.get('/demo', async (ctx)=>{
  try{
    let users = await db.collection("user");
    let user = {};
    user.name = 'andyOne' + Math.floor(Math.random()*100);
    user.age = Math.floor(Math.random()*100)
    let result = await users.insertOne(user);
    ctx.body="hello demo"
  }catch(e){
    console.log(e)
  }
});

router.post('/upload',koaBody({
  multipart: true,
  encoding:'gzip',
  formidable:{uploadDir:'../public/files/',keepExtensions: true},
  formidable: {
      maxFileSize: 1000*1024*1024	// 设置上传文件大小最大限制，默认2M
  }
}), async (ctx)=>{
	// const file = ctx.request.body.files.file;	// 获取上传文件
	// const reader = fs.createReadStream(file.path);	// 创建可读流
	// const ext = file.name.split('.').pop();		// 获取上传文件扩展名
	// const upStream = fs.createWriteStream(`upload/${Math.random().toString()}.${ext}`);		// 创建可写流
	// reader.pipe(upStream);	// 可读流通过管道写入可写流
  // ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
  
  const file = ctx.request.files.file;
  console.log(file)
  const {originalFilename:name, mimetype:type} = file;
  const fileExtension = mime.extension(type)
  console.log(`filename: ${name}`)
  console.log(`type: ${type}`)
  console.log(`fileExtension: ${fileExtension}`)

  // 创建文件流
  const reader = fs.createReadStream(file.filepath);
  // 处理文件写入路径
  const path = __dirname + '/../public/files/'+name 
  // 创建写入流
  const upStream = fs.createWriteStream(path);
  // 数据写入文件
  reader.pipe(upStream);
  let dataBuffer = fs.readFileSync(file.filepath);
  let data = await pdf(dataBuffer);
  
	return ctx.body = data.text;
})

app.use(router.routes()).use(router.allowedMethods())
app.listen(process.env.PORT || 3000,function(){
    console.log("server is running at http://localhost:"+(process.env.PORT || 3000))
})