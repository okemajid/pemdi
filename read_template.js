const XlsxPopulate = require('xlsx-populate');

XlsxPopulate.fromFileAsync('public/template_laporan.xlsx')
    .then(workbook => {
        workbook.sheets().forEach(sheet => {
            console.log("Sheet:", sheet.name());
        });
        const sheet1 = workbook.sheet(0);
        console.log("B10:", sheet1.cell("B10").value());
        console.log("B11:", sheet1.cell("B11").value());
        console.log("C13:", sheet1.cell("C13").value());
        console.log("C14:", sheet1.cell("C14").value());
        
        const sheet2 = workbook.sheet(1);
        console.log("C8:", sheet2.cell("C8").value());
        console.log("C10:", sheet2.cell("C10").value());
    });
