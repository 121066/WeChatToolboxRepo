Page({
    data: {
        inputText: '',
        qrCodeUrl: '',
        codeType: 'qr',
        canvasWidth: 750,
        canvasHeight: 300,
        encoding: {
            L: [
                '0001101', '0011001', '0010011', '0111101', '0100011',
                '0110001', '0101111', '0111011', '0110111', '0001011'
            ],
            G: [
                '0100111', '0110011', '0011011', '0100001', '0011101',
                '0111001', '0000101', '0010001', '0001001', '0010111'
            ],
            R: [
                '1110010', '1100110', '1101100', '1000010', '1011100',
                '1001110', '1010000', '1000100', '1001000', '1110100'
            ],
            pattern: [
                'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
                'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
            ]
        },
        qrConfig: {
            typeNumber: 4,
            errorCorrectLevel: 'M',
            size: 400,
            margin: 20
        }
    },

    onLoad() {
        const query = wx.createSelectorQuery();
        query.select('#barcodeCanvas')
            .fields({ node: true, size: true })
            .exec((res) => {
                if (res[0]) {
                    this.canvas = res[0].node;
                    this.ctx = this.canvas.getContext('2d');
                }
            });
    },

    onInput(e) {
        let value = e.detail.value || '';
        if (this.data.codeType === 'bar') {
            value = value.replace(/\D/g, '');
        }
        this.setData({ inputText: value });
    },

    switchType(e) {
        const type = e.currentTarget.dataset.type || 'qr';
        this.setData({
            codeType: type,
            inputText: '',
            qrCodeUrl: ''
        });
    },

    generateBarcode() {
        try {
            const { inputText, encoding } = this.data;
            if (!inputText) return;

            const ctx = wx.createCanvasContext('barcodeCanvas');
            if (!ctx) {
                console.error('获取画布上下文失败');
                return;
            }

            ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
            ctx.setFillStyle('#FFFFFF');
            ctx.fillRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);

            const barWidth = 2;
            const height = 200;
            let x = 60;

            this.drawBars(ctx, '101', x, height, barWidth);
            x += barWidth * 3;

            const firstNum = parseInt(inputText[0]) || 0;
            const pattern = encoding.pattern[firstNum];
            if (!pattern) {
                throw new Error('无效的编码规则');
            }

            for (let i = 1; i < 7 && i < inputText.length; i++) {
                const digit = parseInt(inputText[i]) || 0;
                const encodeType = pattern[i - 1];
                const code = encoding[encodeType]?.[digit];
                if (code) {
                    this.drawBars(ctx, code, x, height, barWidth);
                    x += barWidth * 7;
                }
            }

            this.drawBars(ctx, '01010', x, height, barWidth);
            x += barWidth * 5;

            for (let i = 7; i < 13 && i < inputText.length; i++) {
                const digit = parseInt(inputText[i]) || 0;
                const code = encoding.R[digit];
                if (code) {
                    this.drawBars(ctx, code, x, height, barWidth);
                    x += barWidth * 7;
                }
            }

            this.drawBars(ctx, '101', x, height, barWidth);

            this.drawNumbers(ctx, inputText, height, barWidth);

            ctx.draw(false, () => {
                setTimeout(() => {
                    wx.canvasToTempFilePath({
                        canvasId: 'barcodeCanvas',
                        success: (res) => {
                            this.setData({ qrCodeUrl: res.tempFilePath });
                        },
                        fail: (err) => {
                            console.error('生成图片失败:', err);
                            this.showError('生成失败');
                        }
                    });
                }, 300);
            });

        } catch (error) {
            console.error('生成条形码错误:', error);
            this.showError('生成失败');
        }
    },

    drawBars(ctx, pattern, x, height, width) {
        if (!ctx || !pattern) return;

        for (let i = 0; i < pattern.length; i++) {
            if (pattern[i] === '1') {
                ctx.setFillStyle('#000000');
                ctx.fillRect(x + i * width, 0, width, height);
            }
        }
    },

    drawNumbers(ctx, code, height, barWidth) {
        if (!ctx || !code) return;

        ctx.setFillStyle('#000000');
        ctx.setFontSize(24);
        ctx.setTextAlign('center');

        ctx.fillText(code[0] || '', 45, height + 30);

        let textX = 60 + barWidth * 3;
        for (let i = 1; i < 7; i++) {
            textX += barWidth * 7 / 2;
            ctx.fillText(code[i] || '', textX, height + 30);
            textX += barWidth * 7 / 2;
        }

        textX += barWidth * 5;
        for (let i = 7; i < 13; i++) {
            textX += barWidth * 7 / 2;
            ctx.fillText(code[i] || '', textX, height + 30);
            textX += barWidth * 7 / 2;
        }
    },

    showError(msg) {
        wx.showToast({
            title: msg,
            icon: 'none'
        });
    },

    generateCode() {
        const { inputText, codeType } = this.data;

        if (!inputText) {
            this.showError('请输入内容');
            return;
        }

        if (codeType === 'bar') {
            if (!/^\d+$/.test(inputText)) {
                this.showError('条形码只能输入数字');
                return;
            }
            if (inputText.length !== 13) {
                this.showError('请输入13位数字');
                return;
            }
            this.generateBarcode();
        } else {
            this.generateQRCode();
        }
    },

    generateQRCode() {
        try {
            const { inputText } = this.data;
            if (!inputText) return;

            const ctx = wx.createCanvasContext('qrCanvas');
            const size = 400;  // 画布大小
            const margin = 40; // 增加边距
            const cellSize = 10; // 增加点的大小
            const contentSize = size - (margin * 2);

            // 清空画布并设置白色背景
            ctx.setFillStyle('#FFFFFF');
            ctx.fillRect(0, 0, size, size);

            // 生成点阵数据
            const data = this.generateMatrix(inputText);
            const matrixSize = data.length;
            const scale = contentSize / (matrixSize * cellSize);

            // 绘制二维码点阵
            ctx.setFillStyle('#000000');
            for (let row = 0; row < matrixSize; row++) {
                for (let col = 0; col < matrixSize; col++) {
                    if (data[row][col]) {
                        const x = margin + (col * cellSize * scale);
                        const y = margin + (row * cellSize * scale);
                        const w = Math.ceil(cellSize * scale);
                        const h = Math.ceil(cellSize * scale);
                        ctx.fillRect(x, y, w, h);
                    }
                }
            }

            // 生成图片
            ctx.draw(false, () => {
                setTimeout(() => {
                    wx.canvasToTempFilePath({
                        canvasId: 'qrCanvas',
                        success: (res) => {
                            this.setData({
                                qrCodeUrl: res.tempFilePath
                            });
                        },
                        fail: (err) => {
                            console.error('生成图片失败:', err);
                            this.showError('生成失败');
                        }
                    });
                }, 300);
            });

        } catch (error) {
            console.error('生成二维码错误:', error);
            this.showError('生成失败');
        }
    },

    // 生成点阵数据
    generateMatrix(text) {
        const matrix = [];
        const size = 25; // 增加矩阵大小

        // 初始化矩阵
        for (let i = 0; i < size; i++) {
            matrix[i] = new Array(size).fill(false);
        }

        // 添加定位图案
        this.addPositionPattern(matrix, 0, 0);                    // 左上
        this.addPositionPattern(matrix, 0, size - 7);             // 右上
        this.addPositionPattern(matrix, size - 7, 0);             // 左下

        // 添加对齐图案
        this.addAlignmentPattern(matrix, size - 9, size - 9);

        // 添加时序图案
        this.addTimingPattern(matrix, size);

        // 将文本转换为二进制数据
        const binData = text.split('').map(char =>
            char.charCodeAt(0).toString(2).padStart(8, '0')
        ).join('');

        // 蛇形填充数据
        let dataIndex = 0;
        let upward = true;
        for (let right = size - 1; right >= 0; right -= 2) {
            if (right <= 6) right = 5; // 避开左侧定位图案

            const range = upward ? [...Array(size).keys()] : [...Array(size).keys()].reverse();

            for (const i of range) {
                for (let j = right; j > right - 2 && j >= 0; j--) {
                    // 跳过特殊区域
                    if (!this.isReservedArea(i, j, size)) {
                        if (dataIndex < binData.length) {
                            matrix[i][j] = binData[dataIndex] === '1';
                            dataIndex++;
                        }
                    }
                }
            }
            upward = !upward;
        }

        return matrix;
    },

    // 添加定位图案
    addPositionPattern(matrix, row, col) {
        // 绘制7x7的定位图案
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 7; j++) {
                // 外框
                if (i === 0 || i === 6 || j === 0 || j === 6) {
                    matrix[row + i][col + j] = true;
                }
                // 内部实心方块
                else if (i >= 2 && i <= 4 && j >= 2 && j <= 4) {
                    matrix[row + i][col + j] = true;
                }
                // 其他部分为空
                else {
                    matrix[row + i][col + j] = false;
                }
            }
        }
    },

    // 检查是否在定位图案区域
    isPositionPatternArea(i, j, size) {
        // 左上角
        if (i < 7 && j < 7) return true;
        // 右上角
        if (i < 7 && j >= size - 7) return true;
        // 左下角
        if (i >= size - 7 && j < 7) return true;
        return false;
    },

    // 添加对齐图案
    addAlignmentPattern(matrix, row, col) {
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                if (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0)) {
                    matrix[row + i][col + j] = true;
                } else {
                    matrix[row + i][col + j] = false;
                }
            }
        }
    },

    // 添加时序图案
    addTimingPattern(matrix, size) {
        for (let i = 8; i < size - 8; i++) {
            matrix[6][i] = i % 2 === 0;
            matrix[i][6] = i % 2 === 0;
        }
    },

    // 检查是否为保留区域
    isReservedArea(i, j, size) {
        // 检查定位图案区域
        if (this.isPositionPatternArea(i, j, size)) return true;

        // 检查时序图案
        if (i === 6 || j === 6) return true;

        // 检查对齐图案
        if (i >= size - 11 && i <= size - 7 &&
            j >= size - 11 && j <= size - 7) return true;

        return false;
    },

    saveImage() {
        const { qrCodeUrl } = this.data;
        if (!qrCodeUrl) {
            this.showError('请先生成码');
            return;
        }

        wx.saveImageToPhotosAlbum({
            filePath: qrCodeUrl,
            success: () => {
                wx.showToast({
                    title: '保存成功',
                    icon: 'success'
                });
            },
            fail: () => {
                this.showError('保存失败');
            }
        });
    }
}); 