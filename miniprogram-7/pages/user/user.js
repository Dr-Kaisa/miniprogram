Page({

  data: {
    avatarPath: '',
    userName: ''
  },
  ini() {
    this.setData({
      avatarPath: '/assets/noLogin.png',
      userName: '请先登录'
    })
  },
  onShow() {
    // 获取文件系统管理器
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/account.txt`;
    // 读取文件内容
    fs.readFile({
      filePath: filePath,
      encoding: 'utf8',
      success: res => {
        // 将字符串转换为对象
        const accountData = JSON.parse(res.data);
        console.log('读取到的内容：', accountData);
        // 使用读取到的数据
        const userName = accountData.userName;
        const avatarPath = accountData.avatarPath;
        const isTrue = accountData.isTrue;

        if (isTrue) {
          this.setData({
            userName: userName,
            avatarPath: avatarPath
          })
        }
      },
      fail: () => {
        this.ini()
      }
    });
  },

  goLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },
  goFavo() {
    wx.navigateTo({
      url: '/pages/favo/favo'
    })
  },
  goLink() {
    wx.showModal({
      title: '提示',
      content: `QQmail:1816087404@qq.com`,
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  signOut() {
    this.ini()
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/account.txt`;

    fs.unlink({
      filePath: filePath,
      success(res) {
        console.log('文件删除成功', res);
      },
      fail(err) {
        console.error('文件删除失败', err);
      }
    });

  }

})