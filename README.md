# Test Report Generator

## Overview
The Test Report Generator is a web application designed to facilitate the creation of comprehensive test reports. It allows users to input project details, add test cases, and generate reports that can be visualized and exported in various formats.

## Features
- **Dynamic Test Case Management**: Add, remove, and manage test cases easily.
- **Rich Text Editing**: Utilize Quill for enhanced text formatting in test case descriptions and expected results.
- **Drag-and-Drop Sorting**: Use SortableJS to reorder test cases effortlessly.
- **Data Visualization**: Generate interactive charts using Chart.js to visualize test results.
- **PDF Export**: Convert the generated report into a PDF format using html2pdf.js for easy sharing and printing.
- **Screenshot Capture**: Capture screenshots of the report using html2canvas.

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, etc.)
- Basic knowledge of HTML, CSS, and JavaScript

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd test-report-generator
   ```
3. Open `index.html` in your web browser to start using the application.

### Usage
1. Fill in the project information in the provided form.
2. Add test cases by clicking the "+ 新增測試案例" button.
3. Use the drag-and-drop feature to reorder test cases as needed.
4. Format text in the rich text editor for each test case.
5. Generate the report by clicking the "產生報告" button.
6. Visualize test results with charts and export the report as a PDF.

## Included Libraries
- **SortableJS**: For drag-and-drop functionality.
- **Chart.js**: For creating interactive charts.
- **html2pdf.js**: For exporting reports as PDFs.
- **html2canvas**: For capturing screenshots of the report.
- **Quill**: For rich text editing capabilities.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.