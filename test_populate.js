const XlsxPopulate = require('xlsx-populate');

XlsxPopulate.fromFileAsync('public/template_laporan.xlsx')
    .then(workbook => {
        const sheet1 = workbook.sheet(0);
        sheet1.cell("B11").value(2026);
        return workbook.outputAsync();
    })
    .then(buffer => {
        console.log("Buffer size:", buffer.length);
    });
