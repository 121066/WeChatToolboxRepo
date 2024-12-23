// pages/imageProcess/imageProcess.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tempImagePath: '', // 临时图片路径
    processedImagePath: '', // 处理后图片路径
    showSizeOptions: false, // 显示尺寸选项
    sizeOptions: [
      { id: 1, name: '1英寸', width: 295, height: 413 },
      { id: 2, name: '2英寸', width: 413, height: 531 },
      { id: 3, name: '3英寸', width: 531, height: 708 }
    ],
    bgColors: [
      { name: '白色', value: '#FFFFFF' },
      { name: '蓝色', value: '#4A90E2' },
      { name: '红色', value: '#FF4D4F' }
    ],
    selectedSize: null,
    selectedColor: null,
    cropperVisible: false
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

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          tempImagePath: res.tempFiles[0].tempFilePath,
          processedImagePath: '',
          showSizeOptions: true
        });
      }
    });
  },

  // 选择尺寸
  selectSize(e) {
    const { size } = e.currentTarget.dataset;
    this.setData({
      selectedSize: size,
      showSizeOptions: false,
      cropperVisible: true
    });
  },

  // 选择背景色
  selectBgColor(e) {
    const { color } = e.currentTarget.dataset;
    this.setData({
      selectedColor: color
    });
    this.processImage();
  },

  // 处理图片
  async processImage() {
    if (!this.data.tempImagePath || !this.data.selectedSize) return;

    const ctx = wx.createCanvasContext('imageCanvas');
    const size = this.data.selectedSize;
    const bgColor = this.data.selectedColor || '#FFFFFF';

    // 设置画布尺寸
    ctx.setFillStyle(bgColor);
    ctx.fillRect(0, 0, size.width, size.height);

    // 绘制图片
    await this.drawImage(ctx, this.data.tempImagePath, size);

    // 生成图片
    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'imageCanvas',
        success: (res) => {
          this.setData({
            processedImagePath: res.tempFilePath
          });
        },
        fail: (error) => {
          console.error('生成图片失败:', error);
          wx.showToast({
            title: '处理失败',
            icon: 'none'
          });
        }
      });
    });
  },

  // 绘制图片
  drawImage(ctx, path, size) {
    return new Promise((resolve) => {
      wx.getImageInfo({
        src: path,
        success: (res) => {
          const { width, height } = res;
          const scale = Math.min(size.width / width, size.height / height);
          const newWidth = width * scale;
          const newHeight = height * scale;
          const x = (size.width - newWidth) / 2;
          const y = (size.height - newHeight) / 2;

          ctx.drawImage(path, x, y, newWidth, newHeight);
          resolve();
        }
      });
    });
  },

  // 保存图片
  saveImage() {
    if (!this.data.processedImagePath) {
      wx.showToast({
        title: '请先处理图片',
        icon: 'none'
      });
      return;
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.processedImagePath,
      success: () => {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '保存失败',
          icon: 'none'
        });
      }
    });
  },

  // 裁剪完成
  onCropperComplete(e) {
    const { url } = e.detail;
    this.setData({
      tempImagePath: url,
      cropperVisible: false
    });
    this.processImage();
  }
})