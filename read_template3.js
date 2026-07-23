const XlsxPopulate = require('xlsx-populate');

XlsxPopulate.fromFileAsync('public/template_laporan.xlsx')
    .then(workbook => {
        const sheet2 = workbook.sheet(1);
        console.log("Sheet 2 (Indikator):");
        console.log("A8:", sheet2.cell("A8").value());
        console.log("A9:", sheet2.cell("A9").value());
        console.log("B9:", sheet2.cell("B9").value());
        console.log("C9:", sheet2.cell("C9").value());
        console.log("D9:", sheet2.cell("D9").value());
        console.log("E9:", sheet2.cell("E9").value());
        console.log("F9:", sheet2.cell("F9").value());
    });
