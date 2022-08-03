const path = require("path");
const express = require("express");
const cors = require('cors')
const app = express();
const port = 3001;
const multer = require("multer");

const mysql = require('mysql');
const fs = require("fs") // 파일을 읽어오도록 해줌
app.use(express.static("public")); //public이라는 폴더에 있는 파일에 접근 할 수 있도록 설정
const dbinfo = fs.readFileSync('./database.json');
//받아온 json데이터를 객체형태로 변경 JSON.parse
const conf = JSON.parse(dbinfo)
const connection = mysql.createConnection({
    host:conf.host,
    user:conf.user,
    password:conf.password,
    port:conf.port,
    database:conf.database
})

app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: function(req,res,cb){
      cb(null, 'public/img/')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});
//파일 사이즈 지정
const upload = multer({
    storage: storage,
    limits: { fileSize: 30000000 }
  });

// 받아서 보내줌
app.post("/upload", upload.array("image"), function(req, res) {
  const file = req.file;
  const fileList = req.files;
  console.log(fileList);
  res.send(fileList.path);

  })

// 영화 등록
app.post("/addmovie", async (req, res) => {
  const {title,atten, opening, rating, genre, country, runtime, distribution, desc, sns, imgurl} = req.body;
  connection.query(
      "INSERT INTO movie(`name`, `attendance`, `opening`, `rating`, `genre`, `country`, `runningtime`, `distribution`, `desc`, `img`, `sns`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [title,atten, opening, rating, genre, country, runtime, distribution, desc, sns, imgurl],
      (err,rows,fields)=>{
          res.send(req.body)
            })
           }
  )



    //서버실행
app.listen(port, () => {
    console.log("서버 동작 중")
})