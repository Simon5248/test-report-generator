class TestReportTool {
    // ... constructor 和其他方法都維持不變，此處省略 ...
    // 請直接複製貼上整個 class
    constructor() {
        this.reportForm = document.getElementById('reportForm');
        this.testCasesContainer = document.getElementById('testCasesContainer');
        this.addTestCaseBtn = document.getElementById('addTestCaseBtn');
        this.reportOutput = document.getElementById('report-output');

        if (!this.reportForm || !this.testCasesContainer || !this.addTestCaseBtn) {
            console.error('重要的 UI 元素缺失，請檢查 HTML 結構!');
            return;
        }

        this.testCaseIdCounter = 0;
        this.quillInstances = new Map();

        this.initSortable();
        this.initEventListeners();
        
        this.addTestCase();
    }

    initSortable() {
        new Sortable(this.testCasesContainer, {
            animation: 150,
            handle: '.test-case-handle',
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
        });
    }
    
    initEventListeners() {
        this.addTestCaseBtn.addEventListener('click', () => this.addTestCase());

        this.reportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateReport();
        });

        this.reportOutput.addEventListener('click', (event) => {
            if (event.target.id === 'downloadReportBtn') {
                this.downloadPDF();
            }
        });
    }

    addTestCase() {
        this.testCaseIdCounter++;
        const caseId = this.testCaseIdCounter;
        const testCaseHTML = `
            <div class="test-case" id="test-case-${caseId}"><div class="test-case-header"><span class="test-case-handle">☰</span><h3 class="test-case-title">測試案例 #${caseId}</h3><button type="button" class="btn-remove-case" data-case-id="${caseId}">×</button></div><div class="form-grid"><div class="form-group"><label for="case-name-${caseId}">案例名稱</label><input type="text" id="case-name-${caseId}" class="test-case-name" placeholder="例如：使用者登入測試"></div><div class="form-group"><label for="case-status-${caseId}">測試結果</label><select id="case-status-${caseId}" class="test-case-status"><option value="Pass" selected>通過 (Pass)</option><option value="Fail">失敗 (Fail)</option><option value="Skip">忽略 (Skip)</option></select></div></div><div class="form-group"><label>實際結果與截圖</label><div class="quill-editor" id="quill-editor-${caseId}"></div></div></div>
        `;
        this.testCasesContainer.insertAdjacentHTML('beforeend', testCaseHTML);
        const quill = new Quill(`#quill-editor-${caseId}`, {
            theme: 'snow',
            modules: { toolbar: [['bold', 'italic', 'underline'],[{'color':[]},{'background':[]}],[{ 'list': 'ordered'}, { 'list': 'bullet' }],['link', 'image'],['clean']] },
            placeholder: '在此描述測試的實際結果，可貼上截圖...'
        });
        this.quillInstances.set(caseId, quill);
        document.querySelector(`.btn-remove-case[data-case-id="${caseId}"]`).addEventListener('click', (e) => {
            const caseElement = e.currentTarget.closest('.test-case');
            const idToRemove = parseInt(caseElement.id.split('-')[2]);
            this.quillInstances.delete(idToRemove);
            caseElement.remove();
        });
    }

    generateReport() {
        const allStatusSelects = this.reportForm.querySelectorAll('.test-case-status');
        let passCount = 0, failCount = 0, skipCount = 0;
        allStatusSelects.forEach(select => {
            if (select.value === 'Pass') passCount++;
            else if (select.value === 'Fail') failCount++;
            else if (select.value === 'Skip') skipCount++;
        });
        const chartData = {
            labels: ['通過 (Pass)', '失敗 (Fail)', '忽略 (Skip)'],
            values: [passCount, failCount, skipCount]
        };
        let detailsContent = '';
        const testCases = this.reportForm.querySelectorAll('.test-case');
        testCases.forEach((caseEl, index) => {
            const caseId = parseInt(caseEl.id.split('-')[2]);
            const caseName = caseEl.querySelector('.test-case-name').value || `未命名案例 #${index + 1}`;
            const caseStatus = caseEl.querySelector('.test-case-status').value;
            const quill = this.quillInstances.get(caseId);
            const quillContent = quill ? quill.root.innerHTML : '<p><i>無法取得內容</i></p>';
            detailsContent += `<div class="report-detail-item"><h4>${index + 1}. ${caseName}</h4><p><strong>測試結果:</strong> <span class="status-${caseStatus.toLowerCase()}">${caseStatus}</span></p><div><strong>詳細描述:</strong></div><div class="quill-content-render">${quillContent}</div></div>`;
        });
        if (testCases.length === 0) detailsContent = '<p>沒有可報告的測試案例。</p>';
        const reportHTML = `
            <style>
                .report-detail-item img {
                    max-width: 100% !important;
                    height: auto !important;
                    display: block;
                    margin: 10px 0;
                }
                .quill-content-render {
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                .quill-content-render p {
                    margin: 8px 0;
                }
            </style>
            <h2>測試結果總覽</h2>
            <div class="chart-container" style="max-width: 400px; margin: auto;">
                <canvas id="resultsChart"></canvas>
            </div>
            <hr>
            <h2>詳細報告</h2>
            <div id="report-details">${detailsContent}</div>
            <br>
            <button id="downloadReportBtn" class="btn btn-secondary">下載 PDF 報告</button>
        `;
        this.reportOutput.innerHTML = reportHTML;
        this.reportOutput.style.display = 'block';
        this.generateChart(chartData);
    }

    generateChart(data) {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '測試結果',
                    data: data.values,
                    backgroundColor: ['rgba(40, 167, 69, 0.7)','rgba(220, 53, 69, 0.7)','rgba(108, 117, 125, 0.7)'],
                    borderColor: ['#ffffff'],
                    borderWidth: 2
                }]
            },
            options: {
                animation: false,
                responsive: true,
                plugins: { legend: { position: 'top' } }
            }
        });
    }

    /**
     * 【已修正 jsPDF is not defined 錯誤】
     * 手動控制的 PDF 生成方法
     */
    downloadPDF() {
        console.log("手動模式啟動，準備產生壓縮 PDF...");
        
        const element = this.reportOutput;
        const downloadBtn = element.querySelector('#downloadReportBtn');
        const projectName = document.getElementById('projectName').value || 'report';

        if (downloadBtn) downloadBtn.style.visibility = 'hidden';

        // 使用簡單的 html2canvas 配置
        html2canvas(element, { 
            useCORS: true, 
            scale: 1.5,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            if (downloadBtn) downloadBtn.style.visibility = 'visible';

            const imgData = canvas.toDataURL('image/jpeg', 0.7); // 調整圖片品質 (0.7 表示 70% 品質)

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'pt',
                format: 'a4',
                compress: true // 啟用壓縮
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const margin = 30;
            const availableWidth = pdfWidth - margin * 2;
            const availableHeight = pdfHeight - margin * 2;

            // 計算圖片適合的尺寸，並檢查是否需要縮小
            let imgWidth, imgHeight;
            
            // 如果原圖寬度超過可用寬度，進行等比例縮小
            if (imgProps.width > availableWidth) {
                const scaleRatio = availableWidth / imgProps.width;
                imgWidth = availableWidth;
                imgHeight = imgProps.height * scaleRatio;
                
                console.log(`圖片寬度 ${imgProps.width}pt 超過可用寬度 ${availableWidth}pt，按比例 ${scaleRatio.toFixed(2)} 縮小`);
            } else {
                // 圖片寬度未超過，但仍需要檢查是否需要按可用寬度調整
                imgWidth = Math.min(imgProps.width, availableWidth);
                imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            }

            // 如果圖片高度小於等於頁面高度，直接放置
            if (imgHeight <= availableHeight) {
                pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
            } else {
                // 圖片需要分頁處理
                let sourceY = 0;
                let remainingHeight = imgHeight;
                
                while (remainingHeight > 0) {
                    // 計算當前頁面可以放置的圖片高度
                    const pageImgHeight = Math.min(remainingHeight, availableHeight);
                    
                    // 計算在原圖中的裁切比例
                    const cropRatio = pageImgHeight / imgHeight;
                    const cropHeight = imgProps.height * cropRatio;
                    
                    // 創建裁切後的 canvas
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = canvas.width;
                    tempCanvas.height = cropHeight * (canvas.width / imgProps.width);
                    
                    // 繪製裁切的部分
                    tempCtx.drawImage(
                        canvas,
                        0, sourceY * (canvas.height / imgProps.height),
                        canvas.width, tempCanvas.height,
                        0, 0,
                        canvas.width, tempCanvas.height
                    );
                    
                    // 轉換為 base64 並添加到 PDF
                    const croppedImgData = tempCanvas.toDataURL('image/jpeg', 0.9);
                    pdf.addImage(croppedImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);
                    
                    // 更新位置和剩餘高度
                    sourceY += cropHeight;
                    remainingHeight -= pageImgHeight;
                    
                    // 如果還有剩餘內容，添加新頁面
                    if (remainingHeight > 0) {
                        pdf.addPage();
                    }
                }
            }

            pdf.save(`test-report-${projectName}.pdf`);
            
            console.log("PDF 生成完成！");
        }).catch(error => {
            console.error("手動 PDF 生成過程中發生錯誤！", error);
            if (downloadBtn) downloadBtn.style.visibility = 'visible';
            
            // 簡單的錯誤提示
            alert('PDF 生成失敗，請重新嘗試');
        });
    }
}


document.addEventListener('DOMContentLoaded', () => {
    new TestReportTool();
});