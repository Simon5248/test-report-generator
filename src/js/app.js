class TestReportTool {
    constructor() {
        // --- 1. 選取所有必要的 DOM 元素 ---
        this.reportForm = document.getElementById('reportForm');
        this.testCasesContainer = document.getElementById('testCasesContainer');
        this.addTestCaseBtn = document.getElementById('addTestCaseBtn');
        this.reportOutput = document.getElementById('report-output');

        if (!this.reportForm || !this.testCasesContainer || !this.addTestCaseBtn) {
            console.error('重要的 UI 元素缺失，請檢查 HTML 結構!');
            return;
        }

        this.testCaseIdCounter = 0;
        this.quillInstances = new Map(); // 用來存放每個 Quill 實例

        // --- 2. 初始化函式庫與事件監聽 ---
        this.initSortable();
        this.initEventListeners();
        
        // --- 3. 初始時先新增一個測試案例 ---
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
    }

    addTestCase() {
        this.testCaseIdCounter++;
        const caseId = this.testCaseIdCounter;

        const testCaseHTML = `
            <div class="test-case" id="test-case-${caseId}">
                <div class="test-case-header">
                    <span class="test-case-handle">☰</span>
                    <h3 class="test-case-title">測試案例 #${caseId}</h3>
                    <button type="button" class="btn-remove-case" data-case-id="${caseId}">×</button>
                </div>
                <div class="form-grid">
                    <div class="form-group">
                        <label for="case-name-${caseId}">案例名稱</label>
                        <input type="text" id="case-name-${caseId}" class="test-case-name" placeholder="例如：使用者登入測試">
                    </div>
                    <div class="form-group">
                        <label for="case-status-${caseId}">測試結果</label>
                        <select id="case-status-${caseId}" class="test-case-status">
                            <option value="Pass" selected>通過 (Pass)</option>
                            <option value="Fail">失敗 (Fail)</option>
                            <option value="Skip">忽略 (Skip)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>實際結果與截圖</label>
                    <div class="quill-editor" id="quill-editor-${caseId}"></div>
                </div>
            </div>
        `;
        
        this.testCasesContainer.insertAdjacentHTML('beforeend', testCaseHTML);

        const quill = new Quill(`#quill-editor-${caseId}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                ]
            },
            placeholder: '在此描述測試的實際結果，可貼上截圖...'
        });

        this.quillInstances.set(caseId, quill); // 將 Quill 實例儲存起來

        document.querySelector(`.btn-remove-case[data-case-id="${caseId}"]`).addEventListener('click', (e) => {
            const caseElement = e.currentTarget.closest('.test-case');
            const idToRemove = parseInt(caseElement.id.split('-')[2]);
            this.quillInstances.delete(idToRemove); // 移除對應的 Quill 實例
            caseElement.remove();
        });
    }

    /**
     * 產生最終的測試報告 (已修正)
     */
    generateReport() {
        console.log('開始產生報告...'); // 除錯用

        // --- 修正後的數據統計邏輯 ---
        const allStatusSelects = this.reportForm.querySelectorAll('.test-case-status');
        let passCount = 0;
        let failCount = 0;
        let skipCount = 0;
        allStatusSelects.forEach(select => {
            if (select.value === 'Pass') passCount++;
            else if (select.value === 'Fail') failCount++;
            else if (select.value === 'Skip') skipCount++;
        });

        const chartData = {
            labels: ['通過 (Pass)', '失敗 (Fail)', '忽略 (Skip)'],
            values: [passCount, failCount, skipCount]
        };

        // --- 新增：收集詳細報告內容 ---
        let detailsContent = '';
        const testCases = this.reportForm.querySelectorAll('.test-case');
        testCases.forEach((caseEl, index) => {
            const caseId = parseInt(caseEl.id.split('-')[2]);
            const caseName = caseEl.querySelector('.test-case-name').value || `未命名案例 #${index + 1}`;
            const caseStatus = caseEl.querySelector('.test-case-status').value;
            const quill = this.quillInstances.get(caseId);
            const quillContent = quill ? quill.root.innerHTML : '<p><i>無法取得內容</i></p>';

            detailsContent += `
                <div class="report-detail-item">
                    <h4>${index + 1}. ${caseName}</h4>
                    <p><strong>測試結果:</strong> <span class="status-${caseStatus.toLowerCase()}">${caseStatus}</span></p>
                    <div><strong>詳細描述:</strong></div>
                    <div class="quill-content-render">${quillContent}</div>
                </div>
            `;
        });

        if (testCases.length === 0) {
            detailsContent = '<p>沒有可報告的測試案例。</p>';
        }

        const reportHTML = `
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

        document.getElementById('downloadReportBtn').addEventListener('click', () => this.downloadPDF());
    }

    // generateChart 和 downloadPDF 方法維持不變...
    // (為了簡潔，此處省略，請沿用上一版本的方法)
    generateChart(data) {
        const ctx = document.getElementById('resultsChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    label: '測試結果',
                    data: data.values,
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.7)',
                        'rgba(220, 53, 69, 0.7)',
                        'rgba(108, 117, 125, 0.7)'
                    ],
                    borderColor: ['#ffffff'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    downloadPDF() {
        const element = this.reportOutput;
        const projectName = document.getElementById('projectName').value || 'report';
        const opt = {
          margin:       [0.5, 0.5, 0.5, 0.5], // 上、左、下、右 in inch
          filename:     `test-report-${projectName}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // 隱藏下載按鈕，避免出現在 PDF 中
        const downloadBtn = element.querySelector('#downloadReportBtn');
        if (downloadBtn) downloadBtn.style.display = 'none';

        html2pdf().from(element).set(opt).save().then(() => {
            // PDF 產生後，重新顯示按鈕
            if (downloadBtn) downloadBtn.style.display = 'block';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TestReportTool();
});