const path = require("path");
const express = require("express");
const cors = require('cors')
const app = express();
const port = process.env.PORT || 8080;
// const port = 3001
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
    limits: { fileSize: 3000000 }
  });

// 이미지등록 후 이미지저장 파일명 재전송
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

  //전체 출력하기
app.get("/movies", async (req,res)=>{
  console.log(req.body);
  connection.query(
      "select * from movie",(err,rows,fields)=>{
          let arr = [];
          for(i=0; i<=rows.length-1;i++){
           arr = rows[i].img.split(",")
           rows[i].img = arr;}
          res.send(rows);
      }
  )
})

//키워드 출력하기
app.get("/movie/:key", async (req,res)=>{
  const params = req.params
  const {key} = params
  connection.query(
      `select * from movie where sns like '%${key}%'`,(err,rows,fields)=>{
          let arr = [];
          for(i=0; i<=rows.length-1;i++){
           arr = rows[i].img.split(",")
           rows[i].img = arr;
        }
          res.send(rows); //결과 보내주기
      })
})

//액션추가
app.get("/movieaction/:keywordaction", async (req,res)=>{
  const params = req.params
  const {keywordaction} = params
  // console.log(key)
  connection.query(
      `select * from movie where sns like '%${keywordaction}%'`,(err,rows,fields)=>{
          let arr = [];
          for(i=0; i<=rows.length-1;i++){
           arr = rows[i].img.split(",")
           rows[i].img = arr;
        }
          res.send(rows); //결과 보내주기
      })
})

// 영화 자세히보기 확인
app.get("/detail/:id", async (req,res)=>{
  const params = req.params
  const {id} = params
  connection.query(
      `select * from movie where no = ${id}`,(err,rows,fields)=>{
          let arr = [];
           arr = rows[0].img.split(",")
           rows[0].img = arr;
            res.send(rows); 
        })
      })

// 회원가입

app.post("/addmember", async (req, res) => {
  const phone = `${req.body.phone1}-${req.body.phone2}-${req.body.phone3}`   
  const {id,pw,name,email} = req.body;
  connection.query(
      "INSERT INTO member(`id`,`pw`,`mname`,`phone`,`email`) VALUES (?, ?, ?, ?,?)",
      [id,pw,name,phone,email],
      (err,rows,fields)=>{
          res.send(req.body)
            })
           }
  )
   // ID중복체크
   app.get("/checkmember/:id", async (req,res)=>{
    const params = req.params
    const {id} = params
    connection.query(
      `select id from member where id = '${id}'`,(err,rows,fields)=>{   
        res.send(rows); 
          })
        })

  // 로그인용 id비번확인
app.post("/member", async (req,res)=>{
  // console.log(req)
  const {id, pw} = req.body
  // console.log(id,pw)
  connection.query(
      `select id,pw,mname from member where id = '${id}'`,(err,rows,fields)=>{
          // console.log(rows);
          // console.log(err);
          res.send(rows[0]); //결과 보내주기~~
      }

  )
})
// 찜하기 등록
app.post("/favorites", async (req, res) => {
  const {id,name} = req.body;
  connection.query(
      "INSERT INTO favorites(`id`,`name`) VALUES (?, ?)",
      [id,name],
      (err,rows,fields)=>{
          res.send(req.body)
            })
           }
  )

  // 찜하기 목록(id별)
  app.get("/favorit/:id", async (req,res)=>{
    const params = req.params
    const {id} = params
    console.log(id)
    connection.query(
      `SELECT a.name,a.no,b.attendance,b.opening,b.genre,b.rating,b.runningtime,b.img,b.no as num from movie as b
 RIGHT OUTER JOIN favorites as a on b.name = a.name where a.id = '${id}'`,(err,rows,fields)=>{
          let arr = [];
          for(i=0; i<=rows.length-1;i++){
          arr = rows[i].img.split(",")
          rows[i].img = arr;
          } 
              res.send(rows); 
          })
        })
// 찜하기 삭제
    app.post("/delfavorites/:no", async (req,res)=>{
      const params = req.params
      const {no} = params
      connection.query(
        `DELETE FROM favorites WHERE no=${no}`,
        (err,rows,fields)=>{
            res.send(req.body)
              })
             
    })
    //서버실행
app.listen(port, () => {
    console.log("서버 동작 중")
})