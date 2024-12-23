// pages/homeIndex/homeIndex.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 快捷入口配置
    quickEntries: [
      {
        id: 1,
        title: '股票成本',
        icon: '/assets/icons/stock.png',
        path: '/pages/home/home',
        desc: '快速计算股票成本'
      },
      {
        id: 2,
        title: '图片处理',
        icon: '/assets/icons/image.png',
        path: '/pages/imageProcess/imageProcess',
        desc: '专业图片编辑工具'
      },
      {
        id: 3,
        title: '图片上传',
        icon: '/assets/icons/upload.png',
        path: '/pages/imageUpload/imageUpload',
        desc: '批量上传管理工具'
      },
      {
        id: 4,
        title: '生成码',
        icon: '/assets/icons/qrcode.png',
        path: '/pages/generateCode/generateCode',
        desc: '生成二维码/条形码'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 添加扫码快捷方式
  handleScan() {
    wx.scanCode({
      success: (res) => {
        console.log('扫码结果:', res);
        // 可以根据需要处理扫码结果
        wx.showModal({
          title: '扫码结果',
          content: res.result,
          confirmText: '复制',
          success(modal) {
            if (modal.confirm) {
              wx.setClipboardData({
                data: res.result,
                success() {
                  wx.showToast({
                    title: '已复制',
                    icon: 'success'
                  });
                }
              });
            }
          }
        });
      },
      fail: (error) => {
        console.error('扫码失败:', error);
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  },

  // 修改跳转处理
  handleNavigate(e) {
    const { path } = e.currentTarget.dataset;

    // 扫码工具直接调用扫码
    if (path === '/pages/scanCode/scanCode') {
      this.handleScan();
      return;
    }

    wx.navigateTo({
      url: path,
      fail() {
        wx.showToast({
          title: '页面开发中',
          icon: 'none'
        });
      }
    });
  }
})