Page({
  data: {
    menuOpen: false,
    showCheckinPopup: false,
    continuousDays: 0,
    days: [],
    isLeave: false,
    selectedDate: '',
    leaveReason: '',
    leaveStartDate: '',
    leaveEndDate: '',
    today: '',
    checkinImage: '',
    woolfImgUrl: 'cloud://cloud1-6gp93nl152185a11.636c-cloud1-6gp93nl152185a11-1358950116/my-photo.png'
  },

  onLoad() {
    this.initCalendar()
  },

  initCalendar() {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // 获取当月第一天是星期几
    const firstDayWeek = firstDay.getDay()
    
    // 生成日历数据
    const days = []
    
    // 填充月初空白日期
    for (let i = 0; i < firstDayWeek; i++) {
      days.push({ day: '', empty: true })
    }
    
    // 填充当月日期
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        day: i,
        date: dateStr,
        marked: false,
        read: false,
        leave: false
      })
    }
    
    const today = `${year}-${String(month + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    this.setData({ 
      days,
      selectedDate: today,
      today: today,
      leaveStartDate: today,
      leaveEndDate: today
    })
    this.loadCheckinData()
  },

  loadCheckinData() {
    // 从本地存储加载打卡数据
    const checkinData = wx.getStorageSync('checkinData') || {}
    const leaveData = wx.getStorageSync('leaveData') || {}
    const days = this.data.days.map(day => {
      if (day.date) {
        // 重置所有标记
        const newDay = { ...day, marked: false, read: false, leave: false }
        // 根据存储的数据设置新的标记
        if (checkinData[day.date]) {
          newDay.marked = true
          newDay.read = true
        }
        if (leaveData[day.date]) {
          newDay.marked = true
          newDay.leave = true
        }
        return newDay
      }
      return day
    })
    
    // 计算连续打卡天数
    let continuousDays = 0
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    let checkDate = today
    
    while (checkinData[checkDate]) {
      continuousDays++
      const date = new Date(checkDate)
      date.setDate(date.getDate() - 1)
      const prevDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      checkDate = prevDate
    }
    
    this.setData({ days, continuousDays })
  },

  markDay(e) {
    const index = e.currentTarget.dataset.index
    const day = this.data.days[index]
    
    if (day.empty) return
    
    this.setData({
      showCheckinPopup: true,
      isLeave: day.leave,
      selectedDate: day.date,
      leaveReason: day.leave ? wx.getStorageSync('leaveData')[day.date]?.reason || '' : ''
    })
  },

  toggleMenu() {
    this.setData({
      menuOpen: !this.data.menuOpen
    })
  },

  closeCheckinPopup() {
    this.setData({
      showCheckinPopup: false,
      isLeave: false,
      leaveReason: '',
      leaveStartDate: this.data.today,
      leaveEndDate: this.data.today,
      checkinImage: ''
    })
  },

  gotoCheckin() {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    this.setData({
      menuOpen: false,
      showCheckinPopup: true,
      isLeave: false,
      selectedDate: today
    })
  },

  gotoLeave() {
    const today = this.data.today
    this.setData({
      menuOpen: false,
      showCheckinPopup: true,
      isLeave: true,
      selectedDate: today,
      leaveStartDate: today,
      leaveEndDate: today
    })
  },

  selectPrevDay() {
    const date = new Date(this.data.selectedDate)
    date.setDate(date.getDate() - 1)
    const prevDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    this.setData({
      selectedDate: prevDate
    })
  },

  selectNextDay() {
    const date = new Date(this.data.selectedDate)
    date.setDate(date.getDate() + 1)
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const nextDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (nextDate > today) return
    this.setData({
      selectedDate: nextDate
    })
  },

  onLeaveReasonInput(e) {
    this.setData({
      leaveReason: e.detail.value
    })
  },

  onStartDateChange(e) {
    const startDate = e.detail.value
    this.setData({
      leaveStartDate: startDate,
      leaveEndDate: this.data.leaveEndDate < startDate ? startDate : this.data.leaveEndDate
    })
  },

  onEndDateChange(e) {
    this.setData({
      leaveEndDate: e.detail.value
    })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      camera: 'back',
      success: (res) => {
        this.setData({
          checkinImage: res.tempFiles[0].tempFilePath
        })
      }
    })
  },

  chooseImageFromAlbum() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({
          checkinImage: res.tempFiles[0].tempFilePath
        })
      }
    })
  },

  previewImage() {
    wx.previewImage({
      urls: [this.data.checkinImage]
    })
  },

  deleteImage() {
    this.setData({
      checkinImage: ''
    })
  },

  confirmCheckin() {
    const { selectedDate, isLeave, leaveReason, leaveStartDate, leaveEndDate, checkinImage } = this.data
    
    if (isLeave) {
      if (!leaveReason.trim()) {
        wx.showToast({
          title: '请输入请假原因',
          icon: 'none'
        })
        return
      }

      if (leaveEndDate < leaveStartDate) {
        wx.showToast({
          title: '结束日期不能早于开始日期',
          icon: 'none'
        })
        return
      }
      
      // 保存请假数据
      const leaveData = wx.getStorageSync('leaveData') || {}
      const start = new Date(leaveStartDate)
      const end = new Date(leaveEndDate)
      
      // 为日期范围内的每一天添加请假记录
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        leaveData[dateStr] = {
          reason: leaveReason,
          timestamp: new Date().getTime(),
          startDate: leaveStartDate,
          endDate: leaveEndDate
        }
      }
      wx.setStorageSync('leaveData', leaveData)
      
      // 清除日期范围内的打卡记录
      const checkinData = wx.getStorageSync('checkinData') || {}
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        if (checkinData[dateStr]) {
          delete checkinData[dateStr]
        }
      }
      wx.setStorageSync('checkinData', checkinData)
    } else {
      if (!checkinImage) {
        wx.showToast({
          title: '请上传打卡图片',
          icon: 'none'
        })
        return
      }

      // 上传图片到云存储
      wx.showLoading({
        title: '正在上传...',
      })

      // 这里需要替换为你的云存储上传逻辑
      // 示例：上传到云存储并获取文件ID
      const cloudPath = `checkin/${selectedDate}_${Date.now()}.jpg`
      wx.cloud.uploadFile({
        cloudPath,
        filePath: checkinImage,
        success: res => {
          // 保存打卡数据
          const checkinData = wx.getStorageSync('checkinData') || {}
          checkinData[selectedDate] = {
            timestamp: new Date().getTime(),
            imageFileID: res.fileID
          }
          wx.setStorageSync('checkinData', checkinData)
          
          // 如果之前是请假状态，清除请假记录
          const leaveData = wx.getStorageSync('leaveData') || {}
          if (leaveData[selectedDate]) {
            delete leaveData[selectedDate]
            wx.setStorageSync('leaveData', leaveData)
          }
          
          // 更新日历显示
          this.loadCheckinData()
          
          // 关闭弹窗
          this.setData({
            showCheckinPopup: false,
            isLeave: false,
            leaveReason: '',
            leaveStartDate: this.data.today,
            leaveEndDate: this.data.today,
            checkinImage: ''
          })
          
          // 显示成功提示
          wx.showToast({
            title: '打卡成功',
            icon: 'success'
          })
        },
        fail: err => {
          wx.showToast({
            title: '上传失败',
            icon: 'error'
          })
        },
        complete: () => {
          wx.hideLoading()
        }
      })
    }
  },

  gotoNote() {
    this.setData({
      menuOpen: false,
      showCheckinPopup: false
    })
    wx.navigateTo({
      url: '/pages/note/note'
    })
  }
})
