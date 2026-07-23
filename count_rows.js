const XlsxPopulate = require('xlsx-populate');

XlsxPopulate.fromFileAsync('public/template_laporan.xlsx')
    .then(workbook => {
        const sheet2 = workbook.sheet(1);
        let count = 0;
        for (let i = 10; i <= 200; i++) {
            if (sheet2.cell(`A${i}`).value()) {
                count++;
            } else {
                break;
            }
        }
        console.log("Total indicators in template:", count);
    });
