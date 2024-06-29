Page({
  data: {
    user: {
      account: '',
      passwords: ''
    },
  },
  login() {
    console.log(this.data.user)
    wx.request({
      url: 'http://127.0.0.1:3000/login',
      method: 'POST',
      data: {
        code: this.data.user,
      },
      success: (res) => {
        console.log('成功了')
        let response = res.data
        console.log(response)
        if (response.isTrue === 'yes') {
          //用户信息及登录状态存进文件，返回上一页
          // 获取文件系统管理器
          const fs = wx.getFileSystemManager();
          const filePath = `${wx.env.USER_DATA_PATH}/account.txt`;

          const accountData = {
            isTrue: 'yes',
            userName: response.userName,
            avatarPath:response.avatarPath
          };
          // 将数据转换为字符串
          const dataToWrite = JSON.stringify(accountData);
          // 将数据写入文件(追加而非覆盖)
          fs.writeFile({
            filePath: filePath,
            data: dataToWrite,
            encoding: 'utf8',
            success(res) {
              console.log('已存入文件');
            },
            fail(err) {
              console.error('写入文件失败', err);
            }
          });

          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  },
  onAccountChange(e) {
    let account = e.detail.value
    this.setData({
      "user.account": account,
    })
  },
  onPasswordChange(e) {
    let passwords = e.detail.value
    this.setData({
      "user.passwords": passwords,
    })
  },
})