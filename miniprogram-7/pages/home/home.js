var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  data: {
    mapw: '100%',
    maph: "0",
    scale: '10',
    latitude: null,
    longitude: null,
    thatId: null,
    thatLa: null,
    thatLo: null,
    thatTitle: '',
    thatIcon: "/assets/favo.png",
    markers: [],
    keywords: '',
    polyline: null,
  },
  markIndex: 0,
  mapCtx: null,
  favomks: [],

  onLoad: function () {
    this.mapCtx = wx.createMapContext('map')
    wx.getSystemInfo({
      success: res => {
        let thisMapw = res.windowWidth
        let thisMaph = res.windowHeight
        this.setData({
          maph: thisMaph + 'px',
          mapw: thisMapw + 'px'
        })
      }
    })
    //提取收藏地点并显示
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/favo.txt`;

    fs.readFile({
      filePath: filePath,
      encoding: 'utf8',
      success: (res) => {
        const fileContent = res.data;
        const lines = fileContent.trim().split('\n');
        const favoArray = lines.map(line => JSON.parse(line));
        this.favomks = favoArray;
        this.setData({
          markers:this.favomks
        })
        console.log(fileContent)
        console.log('收藏地点:', favoArray);
      },
      fail(err) {
        console.error('读取文件失败', err);
      }
    });
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'EVWBZ-NPBRQ-IR45O-4ONH3-7UFI7-FNBJH'
    });
  },

  onShow() {
    //定位到当前位置
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        console.log(res)
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    })
    
  },
  onReady() {


  },
  getWords(e) {
    this.setData({
      keywords: e.detail.value,
    })
  },
  goSearch() {
    qqmapsdk.search({
      keyword: this.data.keywords,
      location: {
        latitude: this.data.latitude,
        longitude: this.data.longitude
      },
      success: res => {
        var mks = this.data.markers
        for (var i = 0; i < res.data.length; i++) {
          mks.push({
            title: res.data[i].title,
            id: Number(res.data[i].id),
            latitude: res.data[i].location.lat,
            longitude: res.data[i].location.lng,
            iconPath: "/assets/a.png", //图标路径
            width: 20,
            height: 20
          })
        }
        this.setData({
          markers: mks
        })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },

  onMarkerTap(event) {
    console.log(event)
    const markerId = event.markerId;
    const marker = this.data.markers.find(m => m.id === markerId);
    console.log(marker)
    if (marker) {
      this.setData({
        thatLa: marker.latitude,
        thatLo: marker.longitude,
        thatId: marker.id,
        thatTitle: marker.title,
      })
      console.log(marker)
    }
  },

  goLead(e) {
    var _this = this;
    //调用距离计算接口
    qqmapsdk.direction({
      mode: 'driving',
      from: {
        latitude: this.data.latitude,
        longitude: this.data.longitude,
      },
      to: {
        latitude: this.data.thatLa,
        longitude: this.data.thatLo,
      },
      success: function (res) {
        console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        _this.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#FF0000DD',
            width: 4
          }]
        })
      },
      fail: function (error) {
        console.error(error);
      },
      complete: function (res) {
        console.log(res);
      }
    });
  },
  bindRegionChange(e) {
    if (e.type === 'end') {
      this.mapCtx.getCenterLocation({
        success: res => {
          this.onShow
        }
      })
    }
  },
  setStar() {
    const favoPosition = {
      id: Number(this.data.thatId),
      latitude: this.data.thatLa,
      longitude: this.data.thatLo,
      title: this.data.thatTitle,
      iconPath: this.data.thatIcon,
      width: 20,
      height: 20
    }
    
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/favo.txt`;
    // 将数据转换为字符串
    const dataToWrite = JSON.stringify(favoPosition) + '\n';
    // 将数据写入文件(追加而非覆盖)
    fs.appendFile({
      filePath: filePath,
      data: dataToWrite,
      encoding: 'utf8',
      success(res) {
        console.log('已存入文件');
      },
      fail(err) {
        fs.writeFile({
          filePath: filePath,
          data: dataToWrite,
          encoding: 'utf8',
          success(res) {
            console.log('初次写入成功');
          },
          fail(err) {
            console.error('创建文件失败', err);
          }
        });
      }
    });
    let favomks=this.data.markers
    favomks.push(favoPosition)
    this.setData({
      markers:favomks
    })
  }
})