const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
app.use(bodyParser.json())


var db = {
    user: {
        isTrue: 'yes',
        userName: '小明',
        avatarPath: '/assets/man.png'
    },
    
}

//接收登录请求
app.post('/login', (req, res) => {
    console.log(req.body.code)
    //账号正确后将用户信息发过去
    if (req.body.code.account === '123') {
        res.json(db.user)
    }
})


app.listen(3000, () => {
    console.log('running at http://127.0.0.1:3000')
})